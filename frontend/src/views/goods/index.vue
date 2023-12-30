<template>
  <div class="good-container">
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
      />

      <page-size-selector v-model="pageSize"/>

      <el-button @click="openEditor(null)" type="primary"
      >添加商品
      </el-button>

      <transition name="el-fade-in">
        <el-button
          @click="deleteSelections"
          v-show="selections && selections.length > 0"
          type="danger"
        >删除选中
        </el-button>
      </transition>

      <searcher @search="search"/>
    </div>

    <goods-editor ref="editor" @close="closeEditor"/>
    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="table"
        @selection-change="handleSelectionChange"
        class="table"
        row-key="id"
        :border="true"
        :stripe="true"
        :data="goods"
      >
        <el-table-column label="选择" type="selection" width="55"/>

        <el-table-column width="100" align="center" label="ID">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.id)"/>
          </template>
        </el-table-column>

        <el-table-column width="300" align="center" label="货号">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.code)"/>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="provider.name" label="供应商"/>


        <el-table-column align="center" width="200" label="颜色">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.color)"/>
          </template>
        </el-table-column>

        <el-table-column align="center" width="200" label="成本价" prop="purchase_price"></el-table-column>
        <el-table-column align="center" width="200" label="销售价" prop="sale_price"></el-table-column>


        <el-table-column align="center" label="图片">
          <template v-slot="scope">
            <el-image
              v-if="scope.row.picture"
              fit="contain"
              style="width: 100px; height: 100px"
              :src="scope.row.picture.url"
              :preview-src-list="[scope.row.picture.formats.large.url]"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          label="备注"
        >
          <template v-slot="scope">{{ scope.row.comment ? scope.row.comment : '-' }}</template>
        </el-table-column>

        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <el-button
              @click="openEditor(scope.row)"
              type="primary"
              size="small"
            >编辑
            </el-button>
            <el-button @click="deleteGood(scope.row)" type="danger" size="small"
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
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import pageSizeSelector from '@/components/PageSizeSelector'
import { queryAll, del, update, add } from '@/api/goods'
import goodsEditor from '@/views/goods/goodsEditor'
import { brightenKeyword } from '@/utils'
import searcher from '@/components/Searcher'

export default {
  name: 'index',
  components: {
    pageSizeSelector, goodsEditor, searcher
  },

  data() {
    return {
      loadProgress: 0,
      mode: -1,
      loading: false,

      selections: [],
      providers: [],
      goods: [],

      pageIndex: 1,
      totalPage: 0,
      pageSize: 10,

      searchText: '',
      currentHighlight: ''
    }
  },
  mounted() {
    this.load()
  },

  watch: {
    pageSize() {
      this.delayLoad()
    }
  },

  methods: {
    search(value) {
      this.searchText = value
      this.pageIndex = 1
      this.delayLoad()
    },

    formatter(value) {
      return brightenKeyword(value, this.currentHighlight)
    },

    handleSelectionChange(val) {
      this.selections = val
    },

    __delete(items) {
      let ids = items.map((item) => item.id)
      Promise.all(items.map(({ id }) => del(id))).then(res => {
        this.delayLoad()
        this.$refs.table.clearSelection()
        this.$message.success('删除成功')
      }).catch(err => {
        this.$message.error('删除失败')
      })
    },

    deleteGood(item) {
      this.$confirm('确认删除此商品？（相关库存也将被永久删除！）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.__delete([item])
      }).catch(() => {
      })
    },

    deleteSelections() {
      this.$confirm('确认删除所有选中商品？（相关库存也将被永久删除！）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.__delete(this.selections)
      }).catch(() => {
      })
    },

    openEditor(item) {
      this.$refs.editor.show(item)
    },

    closeEditor() {
      this.delayLoad()
    },

    getFilters() {
      let searchText = this.searchText
      if (searchText === '') {
        return undefined
      } else {
        let id = Number.parseInt(searchText)
        let filters = {
          $or: [
            { code: { $containsi: searchText } },
            { color: { $containsi: searchText } },
            { comment: { $containsi: searchText } }
          ]
        }
        if (id !== Number.NaN) { // 数字
          filters.$or.push({ id: { $eq: id } })
        }
        return filters
      }
    },

    __load() {
      let page = this.pageIndex
      let pageSize = this.pageSize
      let filters = this.getFilters()
      queryAll({
        filters,
        pagination: { page, pageSize },
        populate: '*'
      }).then(res => {
        let { data, meta: { pagination } } = res
        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page
        this.currentHighlight = this.searchText

        this.goods = data
        this.loading = false
        this.$refs.refresh.$el.blur()
      }).catch((err) => {
        this.$message.error('查询失败')
      })
    },

    load() {
      this.loading = true
      this.__load()
    },

    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.good-container {
  padding: 20px;
}


</style>
