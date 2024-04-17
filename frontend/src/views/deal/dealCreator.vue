<template>
  <el-dialog
    v-loading="loading"
    :element-loading-text="loadingText"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="title"
  >
    <goods-selector ref="form" button-title="添  加" @submit="addDeal"/>

    <el-table
      style="margin-top: 20px"
      height="300px"
      empty-text="请在上方添加订单详情"
      row-key="id"
      :data="order.deals"
    >
      <el-table-column align="center" prop="good.code" label="货号"/>
      <el-table-column align="center" prop="good.color" label="颜色"/>
      <el-table-column align="center" prop="provider.name" label="供应商"/>
      <el-table-column align="center" prop="size" label="尺寸"/>
      <el-table-column align="center" prop="amount" label="数量">
        <template v-slot="scope">
          <span style="margin-right: 5px">{{ scope.row.amount }}</span>
          ( 库存:
          <span :class="{ red: scope.row.stock < scope.row.amount }">  {{
              scope.row.stock
            }}</span> )
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作">
        <template v-slot="scope">
          <el-button @click="remove(scope.row)" type="danger" size="small"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-input
      style="margin-top: 20px"
      type="textarea"
      :rows="2"
      v-model="order.comment"
      autocomplete="off"
      placeholder="备注信息"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="close(false)">取 消</el-button>
      <el-button @click="close(true)" type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {addSaleCollection} from "@/api/sale";
import {addPurchaseCollection} from "@/api/purchase";
import GoodsSelector from '@/components/GoodSelector'
import {queryAllStocks} from "@/api/stock";
import assert from "assert";

import {DEAL_MODE} from './index'

export default {
  name: "DealCreator",
  props: ['mode'],
  components: {GoodsSelector},
  computed: {
    title() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        "新建进货单" : "新建出货单"
    },
    addDealCollection() {
      return this.mode === DEAL_MODE.DEAL_PURCHASE_MODE ?
        addPurchaseCollection : addSaleCollection
    }
  },

  data() {
    return {
      loadingText: "",
      loading: false,
      visible: false,
      order: this.getDefaultOrder(),
    };
  },
  methods: {
    async addDeal(deal) {
      // 当前列表是否已经存在
      let id = this.order.deals.findIndex((item) => {
        return (
          item.good.id === deal.good.id &&
          item.provider.id === deal.provider.id &&
          item.size === deal.size
        );
      });

      if (id !== -1) {
        this.order.deals[id].amount += deal.amount;
      } else {
        this.loadingText = "获取库存中";
        this.loading = true;
        let {data: stocks} = await queryAllStocks({
          filters: {
            good: deal.good,
            size: deal.size,
          },
        });
        this.loading = false;
        assert(stocks.length <= 1);
        this.order.deals.push({
          ...deal,
          stock: stocks[0]?.amount || 0,
        });
      }
    },
    getDefaultOrder() {
      return {
        comment: "",
        deals: [],
      };
    },

    remove(item) {
      // this.order.remove(item)
      this.order.deals = this.order.deals.filter((obj) => obj !== item);
    },
    show() {
      this.order = this.getDefaultOrder();
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.form.renew();
      });
    },

    close(save) {
      if (!save) {
        this.$emit("close");
        this.visible = false;
        return;
      }

      if (this.order.deals.length === 0) {
        this.$message.warning("当前订单未包含任何商品");
        return;
      }

      this.loadingText = "正在创建出货单";
      this.loading = true;

      this.addDealCollection(this.order)
        .then((res) => {
          let {data} = res;
          // console.log(res);

          setTimeout(() => {
            this.loading = false;
            this.$message.success("创建成功");
            this.$emit("close");
            this.visible = false;
          }, 500);
        })
        .catch((err) => {
          this.$message.error("创建失败");
        });
    },
  },
};
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

.red {
  color: red;
}
</style>
