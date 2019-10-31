<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色按钮 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <!-- 展开列 -->
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag closable @close="removeRithtById(scope.row, item1.id)">
                  {{item1.authName}}
                  <i class="el-icon-caret-right"></i>
                </el-tag>
              </el-col>
              <!-- 二三级权限区域 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2===0?'':'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRithtById(scope.row, item2.id)">
                      {{item2.authName}}
                      <i class="el-icon-caret-right"></i>
                    </el-tag>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRithtById(scope.row, item3.id)"
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="主管"></el-table-column>
        <el-table-column prop="roleDesc" label="技术负责人"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger">删除</el-button>
            <el-button
              @click="showSetRightsDialog(scope.row)"
              icon="el-icon-setting"
              size="mini"
              type="warning"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetRightsVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        default-expand-all
        show-checkbox
        node-key="id"
        :default-checked-keys="lefKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightsVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //获取所有角色
      rolesList: [],
      //分配权限对话框
      showSetRightsVisible: false,
      //获取所有权限
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //点击分配权限时该角色拥有的所有三级权限的id数组
      lefKeys: [],
      //点击分配权限时该角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    async removeRithtById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      //this.getRolesList() 会发生页面重新渲染
      //将获取的权限信息直接赋值给角色
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightsDialog(role) {
      //获取点击分配权限时该角色的id
      this.roleId = role.id

      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分配权限列表失败！')
      }
      this.rightsList = res.data

      //在打开对话框之前就获取角色的三级权限的id
      this.getLefKeys(role, this.lefKeys)
      console.log(this.lefKeys)
      this.showSetRightsVisible = true
    },
    //通过递归的方法获取点击分配权限时该角色的所有三级权限的id
    getLefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLefKeys(item, arr)
      })
    },
    //关闭分配权限的对话框时清空defKeys
    setRightsDialogClosed() {
      this.lefKeys = []
    },
    //点击分配权限对话框中的确定按钮时
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      //重新刷新权限列表
      this.getRolesList()
      //隐藏对话框
      this.showSetRightsVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>