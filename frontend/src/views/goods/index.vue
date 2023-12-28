<template>
  <div class="user-container">
    <div class="global-container">
      <el-button
        ref="refresh"
        @click="delayLoad"
        icon="el-icon-refresh-right"
        class="add-new"
      ></el-button>
      <el-button @click="openEditor(null)" type="primary" class="add-new"
        >添加商品</el-button
      >
      <transition name="el-fade-in">
        <el-button
          @click="deleteSelections"
          v-show="selections && selections.length > 0"
          type="danger"
          class="del-sel"
        >
          删除选中
        </el-button>
      </transition>
    </div>

    <el-dialog
      :visible.sync="editorVisible"
      :title="editorTitle"
      @opened="clearValidate()"
    >
      <el-form :rules="rules" ref="editor" :model="this.selected">
        <el-form-item prop="name" label="商品名称">
          <el-input v-model="selected.name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item prop="address" label="地址">
          <el-input v-model="selected.address" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item prop="phone" label="联系方式">
          <el-input v-model="selected.phone" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditor(false)">取 消</el-button>
        <el-button @click="closeEditor(true)" type="primary">确 定</el-button>
      </div>
    </el-dialog>
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
        <el-table-column label="选择" type="selection" width="55">
        </el-table-column>

        <!-- <el-table-column width="300" align="center" prop="id" label="ID" /> -->

        <el-table-column width="300" align="center" prop="code" label="货号" />

        <el-table-column align="center" width="300" prop="color" label="颜色" />

        <el-table-column
          align="center"
          prop="provider"
          label="供应商"
        />

        <el-table-column align="center" label="图片">
          <template v-slot="scope">
            <el-image 
              v-if="scope.row.picture"
              fit="contain"
              style="width: 100px; height: 100px"
              :src="scope.row.picture">
              
            </el-image>
            <span v-else>
              无
            </span>
          </template>
        </el-table-column>

        <el-table-column align="center" fixed="right" label="操作">
          <template v-slot="scope">
            <el-button
              @click="openEditor(scope.row)"
              type="primary"
              size="small"
              >编辑</el-button
            >
            <el-button @click="deleteUser(scope.row)" type="danger" size="small"
              >删除</el-button
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
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { queryAll, del, update, add } from "@/api/goods";

const EDITOR_MODE_EDIT = 0;
const EDITOR_MODE_NEW = 1;
export default {
  name: "index",
  computed: {
    editorTitle() {
      return this.mode === EDITOR_MODE_EDIT ? "供应商编辑" : "新建供应商";
    },
  },

  data() {
    return {
      mode: -1,
      loading: false,
      editorVisible: false,
      backup: null,
      selected: {},
      selections: [],
      goods: [],
      username: "",
      pageIndex: 1,
      totalPage: 0,
      pageSize: 10,
      rules: {
        name: { required: true, message: "该字段不能为空" },
        address: { required: true, message: "该字段不能为空" },
        phone: { required: true, message: "该字段不能为空" },
      },
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    clearValidate() {
      this.$refs.editor.clearValidate();
    },

    success(msg) {
      this.$message.success(msg);
    },

    fail(msg) {
      this.$message.error(msg);
    },

    handleSelectionChange(val) {
      this.selections = val;
    },

    __delete(items) {
      let ids = items.map((item) => item.id);
      deleteUsers({ ids }).then((res) => {
        this.load();
        this.$refs.table.clearSelection();
        this.success(res.message);
      });
    },

    deleteUser(item) {
      this.$confirm("确认删除此用户？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          this.__delete([item]);
        })
        .catch(() => {});
    },

    deleteSelections() {
      this.$confirm("确认删除所有选中用户？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          this.__delete(this.selections);
        })
        .catch(() => {});
    },

    openEditor(item) {
      this.mode = item == null ? EDITOR_MODE_NEW : EDITOR_MODE_EDIT;
      this.backup = item;
      this.selected = { ...item };
      this.editorVisible = true;
    },

    closeEditor(save) {
      if (save) {
        if (
          this.$refs.editor.validate((valid) => {
            if (!valid) {
              return;
            }
          })
        )
          if (this.mode === EDITOR_MODE_EDIT) {
            // 编辑模式
            update(this.selected).then((res) => {
              console.log(res);
              Object.assign(this.backup, res.data);
              this.success("更新成功");
              this.editorVisible = false;
            });
          } else if (this.mode === EDITOR_MODE_NEW) {
            // 新建模式
            add(this.selected)
              .then((res) => {
                this.load();
                this.success("添加成功");
                this.editorVisible = false;
              })
              .catch((e) => {
                this.fail("添加失败");
              });
          }
      } else {
        this.editorVisible = false;
      }
    },

    __load() {
      // console.log("start loading...");
      queryAll()
        .then((res) => {
          console.log(res);
          let data = res.data;
          let meta = res.meta;

          this.goods = data.map((el) => {
            let {
              id,
              attributes: { code, color, picture, provider },
            } = el;
            console.log(picture);
            return {
              id,
              code,
              color, 
              picture: picture.data && picture.data.attributes.url || '',
              provider: provider.data.attributes.name
            }
          });
          console.log(this.goods);
          this.loading = false;
          this.$refs.refresh.$el.blur();
        })
        .catch((err) => {
          console.log("load err" + err);
        });
    },

    load() {
      this.loading = true;
      this.__load();
    },

    delayLoad() {
      this.loading = true;
      setTimeout(this.__load, 500);
    },
  },
};
</script>

<style lang="scss" scoped>
.user-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.global-container {
  margin: 20px;
}

.table-container {
  width: 100%;

  .table {
    margin-left: 20px;
  }
}

.page-container {
  width: 100%;
  display: flex;
  justify-content: center;
  bottom: 20px;
  position: absolute;
}



</style>
