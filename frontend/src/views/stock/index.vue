<template>
  <div class="stock-container">
    <barcode ref="barcode" />
    <stock-creator ref="creator" @close="delayLoad"/>
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
        class="add-new"
      ></el-button>

      <page-size-selector @input="delayLoad" v-model="pageSize"/>

      <el-button @click="openCreator" type="primary" class="add-new"
      >新建库存
      </el-button>

      <searcher @search="search" :disable="!!currentItem"/>
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
    <div class="table-container">
        <!-- :cell-class-name="tableRowClassName" -->
      <el-table
        v-loading="loading"
        ref="table"
        class="table"
        row-key="id"
        :stripe="true"
        :data="stockData"
      >
        <el-table-column prop="id" label="ID"/>
        <el-table-column label="货号">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.code)"/>
          </template>
        </el-table-column>
        <el-table-column label="颜色">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.color)"/>
          </template>
        </el-table-column>

        <el-table-column prop="good.provider.name" label="供应商">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.good.provider.name)"/>
          </template>
        </el-table-column>
        <el-table-column  label="尺寸">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.size)"/>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="amount" label="数量" :filters="[{ text: '欠货', value: 0 }, { text: '缺货', value: 1 }, { text: '有货', value: 2 }]" :filter-method="filterAmount"> -->
        <el-table-column prop="amount" label="数量">
          <template v-slot="scope">
            <el-input-number v-model="currentItem.amount" size="small"
                             v-if="currentItem && currentItem.id === scope.row.id"/>
            <span v-else :class="{'red-text': scope.row.amount < 0}" v-html="formatter(scope.row.amount)"/>
          </template>
        </el-table-column>


        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <div v-if="currentItem && currentItem.id === scope.row.id">
              <el-button
                @click="saveEditor"
                type="success"
                size="small"
              >保存
              </el-button>
              <el-button
                @click="cancelEditor"
                size="small"
              >取消
              </el-button>
            </div>
            <div v-else>
              <el-button
                @click="openEditor(scope.row)"
                type="primary"
                size="small"
              >编辑
              </el-button>
              <el-button
                @click="showBarcode(scope.row)"
                type="success"
                size="small"
              >条码
              </el-button>
              <el-button
                @click="deleteStock(scope.row)"
                type="danger"
                size="small"
              >删除
              </el-button>
            </div>
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
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { delStock, queryAllStocks, updateStock } from '@/api/stock'
import StockCreator from '@/views/stock/stockCreator'
import { brightenKeyword } from '@/utils'
import pageSizeSelector from '@/components/PageSizeSelector'
import Barcode from './barcode.vue'
import searcher from '@/components/Searcher'

export default {
  name: 'index',
  components: { StockCreator, pageSizeSelector, Barcode, searcher },
  data() {
    return {
      loading: false,
      stockData: [],
      originItem: null,
      currentItem: null,

      pageIndex: 1,
      totalPage: 0,
      pageSize: 15,
      searchText: "",
      currentHighlight: "",
    }
  },

  mounted() {
    this.load()
    this.$bus.$on('commit', () => {
      this.load()
    })
  },

  beforeDestroy() {
    this.$bus.$off('commit')
  },

  methods: {
    filterAmount(value, row, column) {
      switch(value) {
        case 0:
          return row.amount < 0
        case 1:
          return row.amount == 0
        case 2:
          return row.amount > 0
      }
    },
    tableRowClassName({row,column,rowIndex}) {
      return row.amount < 0 ? 'row-owe' : ''
    },
    formatter(value) {
      return brightenKeyword(value, this.currentHighlight)
    },
    cancelEditor() {
      this.originItem = null
      this.currentItem = null
    },

    openEditor(item) {
      if (this.currentItem) {
        this.$confirm('还有未保存的信息，是否放弃？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.originItem = item
          this.currentItem = { ...item }
        }).catch(() => {
        })
      } else {
        this.originItem = item
        this.currentItem = { ...item }
      }
    },

    showBarcode(item) {
      this.$refs.barcode.show(item)
    },

    saveEditor() {
      if (this.currentItem.amount === this.originItem.amount) {
        this.cancelEditor()
      } else {
        updateStock(this.currentItem.id, this.currentItem).then(res => {
          let { data } = res
          // console.log(data)
          Object.assign(this.originItem, data)
          this.cancelEditor()
          this.$message.success('更新成功')
        }).catch(err => {
          this.$message.error('更新失败')
        })
      }
    },

    openCreator() {
      this.$refs.creator.show()
    },

    search(value) {
      this.searchText = value
      this.pageIndex = 1
      this.delayLoad()
    },

    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 500)
    },

    getFilters() {
      let searchText = this.searchText
      if (searchText === '') {
        return undefined
      } else {
        // console.log(searchText);
        let amount = Number.parseInt(searchText)
        let filters = {
          $or: [
            { good: { code: { $containsi: searchText }}},
            { good: { color: { $containsi: searchText }}},
            { good: { provider:{ name: {$containsi: searchText} }}},
            { size: { $containsi: searchText } },
          ]
        }
        if (!Number.isNaN(amount)) { // 数字
          // console.log("amount:", amount);
          filters.$or.push({ amount: { $eq: amount } })
        }
        console.log(filters)
        return filters
      }
    },

    __load() {
      let page = this.pageIndex
      let pageSize = this.pageSize
      let filters = this.getFilters()
      queryAllStocks({
        populate: 'good.provider',
        filters,
        pagination: { page, pageSize },
      }).then(res => {
        let { data, meta: { pagination } } = res
        // console.log(pagination)
        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page
        this.currentHighlight = this.searchText

        this.stockData = data
        this.loading = false
      }).catch((err) => {
        this.$message.error('查询失败')
        this.loading = false
      })
    },
    load() {
      this.loading = true
      this.__load()
    },
    deleteStock(stockItem) {
      this.$confirm('此操作将永久删除此库存信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delStock(stockItem.id).then(res => {
          // console.log(res)
          this.delayLoad()
          this.$message.success('删除成功')
        }).catch(err => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-container {
  padding: 20px;
}


.table-container {
  width: 100%;
}

.global-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  position: relative;

  > *:not(:last-child) {
    margin-right: 10px;
  }
}


.page-container {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.red-text {
  color: red;
}

::v-deep .el-table .row-owe {
  background-color: #f8c3c3a7 !important;
  // .el-table__cell {
  //   background-color: #f8c3c3a7 !important;
  // }
}
</style>
