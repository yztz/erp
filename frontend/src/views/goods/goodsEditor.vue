<template>
  <el-dialog
    :visible.sync="visible"
    :title="editorTitle"
    :close-on-click-modal="false"
  >

    <el-form :rules="rules" label-position="top" ref="form" :model="this.goods">
      <el-row type="flex" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-form-item prop="code" label="货号">
            <el-input v-model="goods.code" autocomplete="off"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item prop="color" label="颜色">
            <el-input v-model="goods.color" autocomplete="off"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row type="flex" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-form-item prop="purchase_price" label="成本价">
            <el-input type="number" v-model="goods.purchase_price" autocomplete="off"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item prop="sale_price" label="销售价">
            <el-input type="number" v-model="goods.sale_price" autocomplete="off"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row type="flex" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-form-item prop="provider.id" label="供应商">
            <el-select style="width: 100%" v-model="goods.provider.id" placeholder="请选择供应商">
              <el-option
                v-for="item in providers"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="picture" label="图片">
            <el-upload
              class="picture-uploader"
              :action="uploadURL"

              name="files"
              :limit="1"
              accept="image/*"
              :headers="credentials"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :on-progress="uploadVideoProcess"
            >
              <el-image v-if="goods.picture" fit="contain" :src="goods.picture.url" class="picture"/>
              <i v-else class="el-icon-plus picture-uploader-icon"></i>
            </el-upload>
            <el-progress v-if="progressFlag" :percentage="loadProgress"></el-progress>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="comment" label="备注">
            <el-input type="textarea" v-model="goods.comment" autocomplete="off"></el-input>
          </el-form-item>
        </el-col>
      </el-row>



    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close(false)">取 消</el-button>
      <el-button @click="close(true)" type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
import { add, update } from '@/api/goods'
import * as Provider from '@/api/provider'
import { getUploadUrl } from '@/api/file'
import assert from 'assert'

const EDITOR_MODE_EDIT = 0
const EDITOR_MODE_NEW = 1
export default {
  name: 'goodsEditor',
  computed: {
    uploadURL() {
      return getUploadUrl()
    },
    editorTitle() {
      return this.mode === EDITOR_MODE_EDIT ? '商品编辑' : '新建商品'
    },
    credentials() {
      return { 'Authorization': 'Bearer ' + getToken() }
    },
    submitData() {
      let good = this.goods
      return {
        code: good.code,
        color: good.color,
        comment: good.comment,
        provider: good.provider.id,
        picture: good.picture?.id,
        purchase_price: good.purchase_price,
        sale_price: good.sale_price
      }
    }
  },
  data() {
    return {
      progressFlag: false,
      loadProgress: 0,
      loadingProviders: false,
      visible: false,
      goods: {
        code: '',
        color: '',
        comment: '',
        provider: { id: null, name: null },
        picture: null,
        sale_price: '',
        purchase_price: '',
      },
      providers: [],
      rules: {
        code: { required: true, message: '该字段不能为空' },
        color: { required: true, message: '该字段不能为空' },
        phone: { required: true, message: '该字段不能为空' },
        purchase_price: { required: true, message: '该字段不能为空' },
        sale_price: { required: true, message: '该字段不能为空' },
        'provider.id': { required: true, message: '该字段不能为空' }
      }
    }
  },
  methods: {
    show(goods) {
      this.visible = true

      // 加载供应商
      this.loadingProviders = true
      Provider.queryAll({
        pagination: {
          limit: -1 // TODO: 修改为滚动加载
        }
      }).then(res => {
        let { data, meta: { pagination } } = res
        assert(pagination.total <= pagination.limit)
        this.providers = data
        this.loadingProviders = false
      })
      // console.log(goods)
      // 拷贝/生成数据
      this.$nextTick(() => {
        if (goods) {
          this.mode = EDITOR_MODE_EDIT
          this.goods = { ...goods }
        } else {
          this.mode = EDITOR_MODE_NEW
          this.$refs.form.resetFields()
        }
      })
    },

    close(save) {
      if (save) {
        this.$refs.form.validate(valid => { // 编辑模式
          if (!valid) return
          if (this.mode === EDITOR_MODE_EDIT) {
            update(this.goods.id, this.submitData).then((res) => {
              this.$message.success('更新成功')
              this.$emit('close')
              this.visible = false
            }).catch(err => {
              this.$message.error('更新失败')
            })
          } else if (this.mode === EDITOR_MODE_NEW) { // 新建模式
            add(this.submitData).then((res) => {
              this.$message.success('添加成功')
              this.$emit('close')
              this.visible = false
            }).catch((e) => {
              this.$message.error('添加失败')
            })
          }

        })
      } else {
        this.visible = false
      }
    },
    // getDefaultGoods() {
    //   return {
    //     code: '',
    //     color: '',
    //     comment: '',
    //     provider: { id: null, name: null },
    //     picture: null
    //   }
    // },
    beforeUpload(file) {
      const valid = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/bmp'
      // const isLt2M = file.size / 1024 / 1024 < 2;

      if (!valid) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      // if (!isLt2M) {
      //   this.$message.error('上传头像图片大小不能超过 2MB!');
      // }
      return valid
    },
    handleUploadSuccess(res, file) {
      let data = res[0]

      this.goods.picture = {
        url: data.url,
        id: data.id
      }

      this.$message.success('上传成功')
    },
    uploadVideoProcess(event, file, fileList) {
      this.progressFlag = true // 显示进度条
      this.loadProgress = parseInt(event.percent) // 动态获取文件上传进度
      if (this.loadProgress >= 100) {
        this.loadProgress = 100
        setTimeout(() => {
          this.progressFlag = false
        }, 300) // 一秒后关闭进度条
      }
    }
  }

}
</script>

<style lang="scss" scoped>
::v-deep .picture-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-upload {
  background: #20a0ff;
}

::v-deep .picture-uploader .el-upload:hover {
  border-color: #409EFF;
}

.picture-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.picture {
  width: 120px;
  height: 120px;
  display: block;
}

</style>
