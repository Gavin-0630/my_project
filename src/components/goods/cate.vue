<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 树形表格区域 -->
      <tree-table
        style="margin-top:15px"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        stripe
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightGreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level ===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页按钮区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="30%"
      @close="addCateDialogClose"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            :options="fatherCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="提示" :visible.sync="editCateDialogVisible" width="30%">
      <el-form
        :model="editCateFormData"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateFormData.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //所有商品
      cateList: [],
      //获取商品列表参数
      queryInfo: {
        pagesize: 5,
        pagenum: 1,
        type: 3
      },
      //总数据条数
      total: 0,
      //为table指定列的含义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //将当前列定义为模板列
          type: 'template',
          //当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      //显示添加分类的对话框
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //添加的分类的名称
        cat_name: '',
        //添加的父级分类的id
        cat_pid: 0,
        //当前分类的等级
        cat_level: 0
      },
      //添加分类的表单项的数据验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //父级分类数据列表
      fatherCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      //选中的父级分类的id数组
      selectedKeys: [],
      //展示编辑分类的对话框
      editCateDialogVisible: false,
      //编辑分类时获取的数据对象
      editCateFormData:{},
      //编辑对话框的验证规则
      editCateFormRules:{
        cat_name:[
           { required: true, message: '请输入分类名称！', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      //把数据复制给cateList
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(res)
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击弹出添加分类的对话框
    showAddCateDialog() {
      this.getFatherCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类的列表
    async getFatherCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.fatherCateList = res.data
    },
    //选择项发生变化触发的函数
    parentCateChange() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        //添加项的父id为
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //添加项的父层级为
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        //如果this.selectedKeys.length = 0 ,证明没有选择父级分类
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //重置添加分类的对话框
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    //添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        //console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //展示编辑分类的对话框
    async showEditCateDialog(id){
      const {data: res} = await this.$http.get('categories/'+id)
      // console.log(res)
      if(res.meta.status !== 200){
        return this.$message.error('获取用户信息失败！')
      }
      this.editCateFormData = res.data
      this.editCateDialogVisible = true
    },
    //编辑分类的信息
    editCateInfo(){
      this.$refs.editCateFormRef.validate( async  valid => {
        // console.log(valid)
        // console.log(this.editCateFormData)
        if(!valid) return
        const {data: res} = await this.$http.put('categories/'+ this.editCateFormData.cat_id, {cat_name: this.editCateFormData.cat_name})
        // console.log(res)
        if(res.meta.status !== 200){
          return this.$message.error('编辑分类失败！')
        }
        this.$message.success('编辑分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
     //删除分类
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
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
        return this.$message.info('已取消了删除！')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  },
  computed: {
    // newFatherCateList () {
    //   let arr = []
    //   this.fatherCateList.forEach(item => {
    //     let activeItem = {}
    //     activeItem.value = item.cat_id
    //     activeItem.label = item.cat_name
    //     activeItem.children = item.children.map(subItem => {
    //       let ele = {}
    //       ele.value = subItem.cat_id
    //       ele.label = subItem.cat_name
    //       return ele
    //     })
    //     arr.push(activeItem)
    //   })
    //   console.log('arr=============>>>>>>>>>', arr)
    //   return arr
    // }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>