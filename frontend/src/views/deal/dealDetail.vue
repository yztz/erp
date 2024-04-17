<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    @close="$emit('close')"
  >
    <el-row>
      <el-col class="label" :span="3">订单日期:</el-col>
      <el-col class="value" :span="6">{{ dealTime }}</el-col>
      <el-col></el-col>
    </el-row>

    <el-row type="flex" align="middle">
      <el-col class="label" :span="3">订单备注:</el-col>

      <el-col class="value" :span="6">
        <el-input autosize :rows="1" @input="commentChanged = true" type="textarea" v-model="collectionData.comment"/>
      </el-col>
      <el-col class="value" :span="2">
        <el-button v-show="commentChanged" @click="updateComment" type="primary" size="mini" icon="el-icon-check"
                   circle></el-button>
      </el-col>


    </el-row>

    <el-row>
      <el-col class="label" :span="3">订单内容:</el-col>
    </el-row>

    <el-row>
      <el-table
        row-key="id"
        v-loading="loading"
        :data="deals"
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
import {queryPurchaseFromID, updatePurchaseCollection, queryPurchaseCollectionFromID} from '@/api/purchase'
import {querySaleFromID, updateSaleCollection, querySaleCollectionFromID} from "@/api/sale";
import moment from 'moment/moment'
import assert from 'assert'

import {DEAL_MODE} from './index'

export default {
  props: ['mode'],
  name: 'DealDetail',
  computed: {
    dealTime() {
      if (!this.collectionData.createdAt) return ''
      const datetime = moment(this.collectionData.createdAt)
      return datetime.format('YYYY年MM月DD日 HH:mm:ss')
    },

    title() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        "进货单详情" : "出货单详情"
    },
    queryDealCollectionFromID() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        queryPurchaseCollectionFromID : querySaleCollectionFromID
    },
    updateDealCollection() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        updatePurchaseCollection : updateSaleCollection
    },
    queryDealFromID() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        queryPurchaseFromID : querySaleFromID
    }
  },
  data() {
    return {
      commentChanged: false,
      deals: [],
      loading: false,
      visible: false,
      collectionData: {
        comment: ''
      },
      collectionID: -1,
    }
  },
  methods: {
    show(collectionID) {
      this.collectionID = collectionID
      this.load()
      this.commentChanged = false
      this.visible = true
    },

    updateComment() {
      assert(this.collectionData)
      this.updateDealCollection(this.collectionID, this.collectionData).then(res => {
        this.$message.success("备注更新成功")
        this.commentChanged = false
      }).catch(err => {
        this.$message.error("备注更新失败")
      })
    },

    async load() {
      assert(this.collectionID >= 0)
      this.loading = true

      let {data} = await this.queryDealCollectionFromID(this.collectionID)
      this.collectionData = data

      this.queryDealFromID(this.collectionID, {
        pagination: {
          start: 0,
          limit: -1
        }
      }).then(res => {
        let {data, meta} = res
        this.deals = data
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
