<template>
  <div class="stock-container">

    <stock-creator ref="creator" @close="delayLoad"/>
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
        class="add-new"
      ></el-button>

      <page-size-selector v-model="pageSize"/>

      <el-button @click="openCreator" type="primary" class="add-new"
      >新建库存
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
    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="table"
        class="table"
        row-key="id"
        :border="true"
        :stripe="true"
        :data="stockData"
      >
        <el-table-column prop="id" label="ID"/>
        <!--          <el-table-column label="创建时间">-->
        <!--            <template v-slot="scope">-->
        <!--              &lt;!&ndash;            <i class="el-icon-time"></i>&ndash;&gt;-->
        <!--              <span style="margin-left: 10px">{{ scope.row.createdAt | formatTime }}</span>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <el-table-column prop="good.code" label="货号"/>
        <el-table-column prop="good.provider.name" label="供应商"/>
        <el-table-column prop="size" label="尺寸"/>
        <el-table-column label="数量">
          <template v-slot="scope">
            <el-input-number :min="0" v-model="currentItem.amount" size="small"
                             v-if="currentItem && currentItem.id === scope.row.id"
            >{{ scope.row.amount }}
            </el-input-number>
            <span v-else>{{ scope.row.amount }}</span>
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
import { delPurchaseCollection } from '@/api/purchase'
import StockCreator from '@/views/stock/stockCreator'
import pageSizeSelector from '@/components/PageSizeSelector'

export default {
  name: 'index',
  components: { StockCreator, pageSizeSelector },
  data() {
    return {
      loading: false,
      stockData: [],
      originItem: null,
      currentItem: null,

      pageIndex: 1,
      totalPage: 0,
      pageSize: 15
    }
  },

  mounted() {
    this.load()
  },
  methods: {
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
    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 500)
    },
    __load() {
      queryAllStocks().then(res => {
        let { data, meta: { pagination } } = res
        // console.log(pagination)
        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page

        this.stockData = data
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
</style>
