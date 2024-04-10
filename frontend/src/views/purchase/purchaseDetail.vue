<template>
  <el-dialog
    :visible.sync="visible"
    title="进货单详情"
    @close="$emit('close')"
  >
    <el-row>
      <el-col class="label" :span="3">订单日期:</el-col>
      <el-col class="value" :span="6">{{ purchaseTime }}</el-col>
      <el-col></el-col>
    </el-row>

    <el-row type="flex" align="middle">
      <el-col class="label" :span="3">订单备注:</el-col>

      <el-col class="value" :span="6">
        <el-input autosize :rows="1" @input="commentChanged = true" type="textarea" v-model="item.comment"/>
      </el-col>
      <el-col class="value" :span="2">
        <el-button v-show="commentChanged" @click="updateComment" type="primary" size="mini" icon="el-icon-check" circle></el-button>
      </el-col>


    </el-row>

    <el-row>
      <el-col class="label" :span="3">订单内容:</el-col>
    </el-row>

    <el-row>
      <el-table
        row-key="id"
        v-loading="loading"
        :data="purchases"
      >
        <el-table-column align="center" prop="good.code" label="货号"/>
        <el-table-column align="center" prop="good.color" label="颜色"/>
        <el-table-column align="center" prop="good.provider.name" label="供应商"/>
        <el-table-column align="center" prop="size" label="尺寸"/>
        <el-table-column align="center" prop="amount" label="数量"/>
      </el-table>
    </el-row>

    <!--    <div slot="footer" class="dialog-footer">-->
    <!--      <el-button @click="closeEditor(false)">取 消</el-button>-->
    <!--      <el-button @click="closeEditor(true)" type="primary">确 定</el-button>-->
    <!--    </div>-->
  </el-dialog>
</template>

<script>
import { queryPurchaseFromID, updatePurchaseCollection } from '@/api/purchase'
import moment from 'moment/moment'
import assert from 'assert'

export default {
  name: 'purchaseDetail',
  computed: {
    purchaseTime() {
      if (this.item == null) return ''
      const datetime = moment(this.item.createdAt)
      return datetime.format('YYYY年MM月DD日 HH:mm:ss')
    },
    comment() {
      if (this.item == null) return ''
      return this.item.comment
    }
  },
  data() {
    return {
      commentChanged: false,
      purchases: [],
      loading: false,
      visible: false,
      item: {}
    }
  },
  methods: {
    show(item) {
      this.item = {...item}
      this.load()
      this.commentChanged = false
      this.visible = true
    },

    updateComment() {
      updatePurchaseCollection(this.item.id, this.item).then(res=>{
        console.log(res)
        this.$message.success("备注更新成功")
        this.commentChanged = false
      }).catch(err=>{
        this.$message.error("备注更新失败")
      })
    },

    load() {
      assert(this.item)
      this.loading = true
      queryPurchaseFromID(this.item.id, {
        pagination: {
          start: 0,
          limit: -1
        }
      }).then(res => {
        let { data, meta } = res
        console.log(res)
        this.purchases = data
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 17px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  text-align: center;
}
</style>
