<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告框 -->
      <el-alert show-icon :closable="false" title="警告提示的文案" type="warning"></el-alert>
      <!-- 商品分类选择区域 -->
      <el-row class="cate_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab区域 -->
      <el-tabs v-model="activeName" @tab-click="handleCateClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数列表 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <!-- 作用域插槽显示展开行里的tag标签 -->
              <template slot-scope="scope">
                <!-- 原有的参数标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 可编辑的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- v-else  -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性列表 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <!-- 作用域插槽显示展开行里的tag标签 -->
              <template slot-scope="scope">
                <!-- 原有的参数标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 可编辑的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- v-else  -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数或静态属性的对话框 -->
    <el-dialog
      :title="'添加'+ titleText "
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addFormClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'修改'+ titleText "
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editFormClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择器配置项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //级联选择器双向绑定的数组
      selectedCateKeys: [],
      //被激活的页签
      activeName: 'many',
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //添加动态参数和静态属性
      addDialogVisible: false,
      //添加参数或属性的对象
      addForm: {},
      //数据校验规则
      addFormRules: {
        attr_name: [
          { required: 'true', message: '请输入参数名称', strigger: 'blur' }
        ]
      },
      //修改对话框
      editDialogVisible: false,
      //修改参数或属性的数据对象
      editForm: {},
      //修改数据的校验规则
      editFormRules: {
        attr_name: [
          { required: 'true', message: '请输入参数名称', strigger: 'blur' }
        ]
      }
      // //可编辑tag的显示
      // inputVisible: false,
      // //可编辑tag的数据
      // inputValue: '',
    }
  },
  created() {
    //获取商品分类
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      console.log(res)
      this.cateList = res.data
    },
    // 当级联选择器选项发生变化时
    async handleChange() {
      console.log(this.selectedCateKeys)
      this.getParamsData(false)
    },
    //切换tab栏
    handleCateClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    //分别获取only和many的数据
    async getParamsData(bol = true) {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //发起请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取三级分类信息失败!')
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      res.data.forEach(item => {
        //判断attr_vals是否为空，为空则返回一个空数组，不为空则进行split分割
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //给没行数据单独添加inputVisible和inputValue
        // item.inputVisible = false
        // item.inputValue = ''   //此种方法行不通
        //强制把视图和数据关联在一起
        this.$set(item, 'inputVisible', false)
        this.$set(item, 'inputValue', '')
      })
    },
    //点击按钮转换成文本框
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //关闭添加对话框时
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击对话框确认按钮发起添加请求事件
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //展示修改参数的对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //重置修改对话框的操作
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //确认修改
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    //删除参数
    async removeParamsById(attr_id) {
      //此处也是获得一个promise对象，所以用async和await,得到一个confirm字符串
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消了删除！')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    //可编辑tag标签
    async handleInputConfirm(row) {
      //判断用户输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果输入的内容是合法的，那么将添加的参数添加到前台数据的数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //并且发起请求
      this.saveParamsOpt(row)
    },
    //删除对应的参数可选项
    async handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveParamsOpt(row)
    },
    //保存对参数可选项的操作
    async saveParamsOpt(row){
       const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数可选项失败！')
      }
      this.$message.success('修改参数可选项成功！')
    },
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //选择的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //判断出dialog中的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  updated() {
    //
  }
}
</script>

<style lang="less" scoped>
.cate_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>