<template>
  <div class="purchase-container">

    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
        class="add-new"
      ></el-button>

      <page-size-selector v-model="pageSize"/>
      <el-button @click="openCreator" type="primary" class="add-new"
      >新建进货单
      </el-button>
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

    <purchase-detail @close="delayLoad" ref="detail"/>
    <purchase-creator @close="delayLoad" ref="creator"/>

    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="table"
        class="table"
        row-key="id"
        :border="true"
        :stripe="true"
        :data="purchaseData"
      >
        <el-table-column prop="id" label="ID"/>
        <el-table-column label="创建时间">
          <template v-slot="scope">
            <!--            <i class="el-icon-time"></i>-->
            <span style="margin-left: 10px">{{ scope.row.createdAt | formatTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="备注"/>


        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <el-button
              @click="openDetail(scope.row)"
              type="primary"
              size="small"
            >查看详情
            </el-button>
            <el-button @click="deletePurchase(scope.row)" type="danger" size="small"
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
        @current-change="load"
        :current-page.sync="pageIndex"
        :page-count="totalPage"
      />
    </div>
  </div>
</template>

<script>
import { queryAllPurchaseCollections, delPurchaseCollection } from '@/api/purchase'
import moment from 'moment'
import PurchaseDetail from '@/views/purchase/purchaseDetail'
import PurchaseCreator from '@/views/purchase/purchaseCreator'
import pageSizeSelector from '@/components/PageSizeSelector'

export default {
  name: 'index',
  components: { PurchaseCreator, PurchaseDetail, pageSizeSelector },
  data() {
    return {
      purchaseData: [],
      loading: false,

      pageIndex: 1,
      totalPage: 0,
      pageSize: 15,
    }
  },
  mounted() {
    this.load()
  },

  filters: {
    formatTime(value) {
      const datetime = moment(value)
      return datetime.format('YYYY年MM月DD日 HH:mm:ss')
    }
  },
  methods: {
    openDetail(item) {
      this.$refs.detail.show(item)
    },
    openCreator() {
      this.$refs.creator.show()
    },
    deletePurchase(item) {
      this.$confirm('此操作将永久删除此订单及其附属详单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delPurchaseCollection(item.id).then(res => {
          // console.log(res)
          this.delayLoad()
          this.$message.success('删除成功')
        }).catch(err => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
      })
    },
    __load() {
      queryAllPurchaseCollections().then(res => {
        let { data, meta: { pagination } } = res

        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page

        this.purchaseData = data
        this.loading = false
      }).catch(err => {
        this.$message.error('查询失败')
        this.loading = false
      })
    },

    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 500)
    },

    load() {
      this.loading = true
      this.__load()
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-container {
  padding: 20px;
}



</style>
