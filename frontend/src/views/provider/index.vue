<template>
  <div class="provider-container">
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
      />
      <page-size-selector v-model="pageSize"/>

      <el-button @click="openEditor(null)" type="primary"
      >添加供应商
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

    <provider-editor @close="closeEditor" ref="editor"/>

    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="table"
        @selection-change="handleSelectionChange"
        class="table"
        row-key="id"
        :border="true"
        :stripe="true"
        :data="providers"
      >
        <el-table-column label="选择" type="selection" width="55"/>

        <el-table-column width="300" align="center" label="ID">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.id)"/>
          </template>
        </el-table-column>

        <el-table-column
          width="300"
          align="center"
          label="供应商名称"
        >
          <template v-slot="scope">
            <span v-html="formatter(scope.row.name)"/>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          width="300"
          label="地址"
        >
          <template v-slot="scope">
            <span v-html="formatter(scope.row.address)"/>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="phone" label="联系方式">
          <template v-slot="scope">
            <span v-html="formatter(scope.row.phone)"/>
          </template>
        </el-table-column>

        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <el-button
              @click="openEditor(scope.row)"
              type="primary"
              size="small"
            >编辑
            </el-button
            >
            <el-button @click="deleteProvider(scope.row)" type="danger" size="small"
            >删除
            </el-button
            >
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
import { queryAll, del } from '@/api/provider'
import PageSizeSelector from '@/components/PageSizeSelector'
import { brightenKeyword } from '@/utils'
import searcher from '@/components/Searcher'
import providerEditor from '@/views/provider/providerEditor'

export default {
  name: 'index',
  components: {
    PageSizeSelector, searcher, providerEditor
  },

  data() {
    return {
      loading: false,

      // 搜索
      searchText: '',
      currentHighlight: '',

      // 数据
      backup: null,
      selected: {},
      selections: [],
      providers: [],

      // 分页
      pageIndex: 1,
      totalPage: 0,
      pageSize: 15

    }
  },

  watch: {
    pageSize() {
      this.delayLoad()
    }
  },

  mounted() {
    this.load()
  },
  methods: {
    formatter(value) {
      return brightenKeyword(value, this.currentHighlight)
    },

    search(value) {
      this.searchText = value
      this.pageIndex = 1
      this.delayLoad()
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

    deleteProvider(item) {
      this.$confirm('确认删除此供应商？（所有相关商品以及库存都将被永久删除！）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.__delete([item])
      }).catch(() => {
      })
    },

    deleteSelections() {
      this.$confirm('确认删除所有选中供应商？（所有相关商品以及库存都将被永久删除！', '提示', {
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
            { name: { $containsi: searchText } },
            { address: { $containsi: searchText } },
            { phone: { $containsi: searchText } }
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
      return queryAll({
        filters,
        pagination: { page, pageSize }
      }).then((res) => {
        let { data, meta: { pagination } } = res
        this.totalPage = pagination.pageCount
        this.pageIndex = pagination.page
        this.currentHighlight = this.searchText

        this.providers = data

        this.loading = false
        this.$refs.refresh.$el.blur()
      }).catch((err) => {
        console.log('load err' + err)
      })
    },

    load() {
      this.loading = true
      return this.__load()
    },

    delayLoad() {
      this.loading = true
      setTimeout(this.__load, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.provider-container {
  padding: 20px;
}

</style>
