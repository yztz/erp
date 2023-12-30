<template>
  <el-dialog :close-on-click-modal="false" :visible.sync="visible" :title="editorTitle" @close="onClose">
    <el-form :rules="rules" ref="form" :model="provider">
      <el-form-item prop="name" label="供应商名称">
        <el-input v-model="provider.name" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item prop="address" label="地址">
        <el-input v-model="provider.address" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item prop="phone" label="联系方式">
        <el-input v-model="provider.phone" autocomplete="off"></el-input>
      </el-form-item>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close(false)">取 消</el-button>
      <el-button @click="close(true)" type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { update, add } from '@/api/provider'

const EDITOR_MODE_EDIT = 0
const EDITOR_MODE_NEW = 1
export default {
  name: 'providerEditor',
  computed: {
    editorTitle() {
      return this.mode === EDITOR_MODE_EDIT ? '供应商编辑' : '新建供应商'
    }
  },
  data() {
    return {
      visible: false,
      mode: -1,
      // 校验
      rules: {
        name: { required: true, message: '该字段不能为空' },
        address: { required: true, message: '该字段不能为空' },
        phone: { required: true, message: '该字段不能为空' }
      },
      provider: this.getDefaultProvider()
    }
  },
  methods: {
    getDefaultProvider() {
      return {
        name: '',
        address: '',
        phone: '',
      }
    },

    onClose() {
      // console.log(this.$refs)
      this.$refs.form.resetFields()
      // console.log("reset")
    },

    show(provider) {
      this.visible = true
      this.$nextTick(()=>{
        if (provider) {
          this.mode = EDITOR_MODE_EDIT
          this.provider = {...provider}
        } else {
          this.mode = EDITOR_MODE_NEW
          this.provider = this.getDefaultProvider()
        }
      })
    },

    close(save) {
      if (save) {
        this.$refs.form.validate((valid) => {
          if (!valid)
            return
          if (this.mode === EDITOR_MODE_EDIT) {
            // 编辑模式
            update(this.provider.id, this.provider).then((res) => {
              this.$message.success("更新成功")
              this.$emit("close")
              this.visible = false
            })
          } else if (this.mode === EDITOR_MODE_NEW) {
            // 新建模式
            add(this.provider).then((res) => {
              this.$message.success('添加成功')
              this.$emit("close")
              this.visible = false
            }).catch(e => {
              this.$message.error('添加失败')
            })
          }
        })
      } else {
        this.visible = false
      }
    },

  }
}
</script>

<style scoped>

</style>
