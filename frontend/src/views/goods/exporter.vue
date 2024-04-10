<template>
  <el-dialog
    :visible.sync="visible"
    title="导出二维码"
    :close-on-click-modal="false"
  >

    

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
import assert from 'assert'

const EDITOR_MODE_EDIT = 0
const EDITOR_MODE_NEW = 1
export default {
  name: 'goodsEditor',
  computed: {
  },
  data() {
    return {
      goods: null,
      visible: false
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
