<template>
  <div class="deal-container">
    <div class="note-container">
      <Note message="订单搜索功能目前仅支持：货号，颜色，供应商"/>
    </div>
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
        class="add-new"
      ></el-button>

      <page-size-selector @input="delayLoad" v-model="pageSize"/>
      <el-button @click="openCreator" type="primary" class="add-new"
      >{{ newTitle }}（批发）
      </el-button>

      <searcher @search="search"/>


      <!--      <transition name="el-fade-in">-->
      <!--        <el-button-->
      <!--          @click="deleteSelections"-->
      <!--          v-show="selections && selections.length > 0"-->
      <!--          type="danger"-->
      <!--          class="del-sel"-->
      <!--        >-->
      <!--          删除选中-->
      <!--        </el-button>-->
      <!--      </transition>-->
    </div>

    <deal-detail @close="delayLoad" :mode="mode" ref="detail"/>
    <deal-creator @close="delayLoad" :mode="mode" ref="creator"/>

    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="table"
        class="table"
        row-key="id"
        :stripe="true"
        :data="dealData"
      >
        <el-table-column prop="id" label="ID" width="100" align="center"/>
        <el-table-column label="货号" align="center">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.code)"/>
          </template>
        </el-table-column>
        <el-table-column label="颜色" align="center">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.color)"/>
          </template>
        </el-table-column>

        <el-table-column prop="good.provider.name" label="供应商" align="center">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.provider.name)"/>
          </template>
        </el-table-column>
        <el-table-column label="尺寸" align="center">
          <template v-slot="scope">
            <span v-html="scope.row.size"/>
          </template>
        </el-table-column>

        <el-table-column label="类型" align="center">
          <template v-slot="scope">
            <el-tooltip v-if="scope.row[dealCollectionFieldName]" class="item" effect="dark" placement="top">
              <div slot="content">{{ '备注：' + scope.row[dealCollectionFieldName].comment || '无' }}</div>
              <el-button @click="openDetail(scope.row)" type="text">批发（详情）</el-button>
            </el-tooltip>
            <span v-else>零售（手机端）</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="数量" align="center">

        </el-table-column>

        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <el-button
              @click="gotoStock(scope.row.good.code)"
              type="success"
              size="small"
            >查看库存
            </el-button>
            <el-button
              @click="deleteDeal(scope.row)"
              type="danger"
              size="small"
            >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
        background
        layout="prev, pager, next"
        @current-change="delayLoad"
        :current-page.sync="pageIndex"
        :page-count="totalPage"
      />
    </div>
  </div>
</template>

<script>
import {queryAllPurchaseCollections, delPurchaseCollection, queryPurchases, delPurchase} from '@/api/purchase'
import {queryAllSaleCollections, delSaleCollection, querySales, delSale} from '@/api/sale'
import moment from 'moment'
import DealDetail from '@/views/deal/dealDetail'
import DealCreator from "@/views/deal/dealCreator";
import Searcher from "@/components/Searcher";
import pageSizeSelector from '@/components/PageSizeSelector'
import gotoStockMixin from "@/views/mixin/gotoStock.mixin";
import {brightenKeyword} from "@/utils";
import Note from "@/components/Note";

export const DEAL_MODE = {
  DEAL_PURCHASE_MODE: 0,
  DEAL_SALE_MODE: 1
}
export default {
  name: 'index',
  components: {DealCreator, DealDetail, pageSizeSelector, Searcher, Note},
  props: ['mode'],
  mixins: [gotoStockMixin],
  data() {
    return {
      dealData: [],
      loading: false,

      pageIndex: 1,
      totalPage: 0,
      pageSize: 15,
      searchText: '',
      currentHighlight: '',
    }
  },
  mounted() {
    // console.log(this.mode)
    this.load()
  },

  computed: {
    // queryAllDealCollections() {
    //   return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
    //     queryAllPurchaseCollections : queryAllSaleCollections
    // },
    // delDealCollection() {
    //   return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
    //     delPurchaseCollection : delSaleCollection
    // },
    delDeal() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        delPurchase : delSale
    },
    newTitle() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        "新建进货单" : "新建出货单"
    },
    queryDeals() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        queryPurchases : querySales
    },
    dealCollectionFieldName() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        'purchase_collection' : 'sale_collection'
    },


  },

  // filters: {
  //   formatTime(value) {
  //     const datetime = moment(value)
  //     return datetime.format('YYYY年MM月DD日 HH:mm:ss')
  //   }
  // },
  methods: {
    formatter(value) {
      return brightenKeyword(value, this.currentHighlight)
    },
    search(value) {
      this.searchText = value
      this.pageIndex = 1
      this.delayLoad()
    },
    openDetail(item) {
      this.$refs.detail.show(item[this.dealCollectionFieldName].id)
    },
    openCreator() {
      this.$refs.creator.show()
    },
    deleteDeal(item) {
      this.$confirm('此操作将永久删除此订单（不会影响库存）, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.delDeal(item.id).then(res => {
          this.delayLoad()
          this.$message.success('删除成功')
        }).catch(err => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
      })
    },
    getFilters() {
      let searchText = this.searchText
      if (searchText === '') {
        return undefined
      } else {
        let filters = {
          $or: [
            {good: {code: {$containsi: searchText}}}, // 货号
            {good: {color: {$containsi: searchText}}}, // 颜色
            {good: {provider: {name: {$containsi: searchText}}}}, // 供应商
            // { size: { $containsi: searchText } },
          ]
        }
        return filters
      }
    },
    __load() {
      let page = this.pageIndex
      let pageSize = this.pageSize
      let filters = this.getFilters()
      this.queryDeals({
        sort: ['createdAt:desc'],
        populate: ['good.provider', this.dealCollectionFieldName],
        pagination: {page, pageSize},
        filters
      }).then(res => {
        let {data, meta: {pagination}} = res

        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page
        this.currentHighlight = this.searchText

        this.dealData = data
        this.loading = false
      }).catch(err => {
        this.$message.error('查询失败')
        this.loading = false
      })
    },

    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 300)
    },

    load() {
      this.loading = true
      this.__load()
    }
  }
}
</script>

<style lang="scss" scoped>

.note-container {
  margin-bottom: 15px;
}

.deal-container {
  padding: 20px;
}

.red-text {
  color: red;
}

</style>
