<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card class="box-card">
      <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="rolesDialogVisible"
        width="50%"
        :before-close="rolesDialogCloseBefore"
        @close="rolesDialogClose"
      >
        <el-form :rules="rolesFormRules" ref="rolesFormRef" :model="rolesForm" label-width="80px">
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="rolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item prop="roleDesc" label="角色描述">
            <el-input v-model="rolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addroles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 表格 -->
      <el-table :data="rolesInfos" border style="width: 100%" :rules="rolesFormRules">
        <el-table-column type="expand" width="60">
          <template slot-scope="roledata">
            <el-row
              v-for="(item,k) in roledata.row.children"
              :key="item.id"
              :style="k===0?'border-bottom:1px solid #ebeef5;border-top:1px solid #EBEEF5':'border-bottom:1px solid #ebeef5'"
            >
              <el-col :span="5">
                <el-tag closable @close="delRight(roledata.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,k2) in item.children"
                  :key="item2.id"
                  :style="{'border-top':k2!==0?'1px solid #ebeef5':''}"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="delRight(roledata.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="delRight(roledata.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="320">
          <!-- 三个按钮 -->
          <template slot-scope="rolesdata">
            <!-- 编辑按钮 -->
            <el-tooltip content="Top Center 编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEidtDialog(rolesdata.row.id)"
              >编辑</el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="Top Center 删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="delRoles(rolesdata.row.id)"
              >删除</el-button>
            </el-tooltip>
            <!-- 分配权限按钮 -->
            <el-tooltip content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="rightDialog(rolesdata.row)"
              >分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑按钮弹框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        :before-close="editDialogCloseBefore"
        @close="editDialogClose"
      >
        <el-form :rules="editFormRules" ref="editFormRef" :model="editForm" label-width="80px">
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item prop="roleDesc" label="角色描述">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editroles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限弹框 -->
      <el-dialog title="分配权限" :visible.sync="rightDialogVisible" width="50%">
        <el-form :model="rightsForm" label-width="120px">
          <el-form-item label="角色名称">{{rightsForm.roleName}}</el-form-item>
          <el-form-item label="分配的权限">
            <el-tree
              :data="rightsInfos"
              show-checkbox
              node-key="id"
              :default-expand-all="true"
              :default-checked-keys="defaultCheckedKeys"
              :props="rightsInfosProps"
              ref="rightsRef"
            ></el-tree>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="clmRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesInfos()
  },
  data() {
    return {
      rolesInfos: [],
      rolesDialogVisible: false,
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      rolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      rightDialogVisible: false,
      rightsForm: {
        id: 0,
        roleName: ''
      },
      rightsInfos: [],
      rightsInfosProps: {
        label: 'authName',
        children: 'children'
      },
      defaultCheckedKeys: []
    }
  },
  methods: {
    async getRolesInfos() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesInfos = res.data
    },
    rolesDialogClose() {
      this.rolesDialogVisible = false
      this.$refs.rolesFormRef.resetFields()
    },
    rolesDialogCloseBefore(done) {
      this.$refs.rolesFormRef.resetFields()
      done()
    },
    addroles() {
      this.$refs.rolesFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.rolesForm)
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.$refs.rolesFormRef.resetFields()
          this.rolesDialogVisible = false
          this.getRolesInfos()
        }
      })
    },
    async showEidtDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message(res.meta.msg)
      this.editForm = res.data
    },
    editDialogClose() {
      this.rolesDialogVisible = false
      this.$refs.editFormRef.resetFields()
    },
    editDialogCloseBefore(done) {
      this.$refs.editFormRef.resetFields()
      done()
    },
    editroles() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          console.log(this.editForm)
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            this.editForm
          )
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.editDialogVisible = false
          this.getRolesInfos()
        }
      })
    },
    delRoles(id) {
      this.$confirm('确定要删除该角色吗？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getRolesInfos()
        })
        .catch(() => {})
    },
    delRight(role, rightid) {
      this.$confirm('确定要删除该权限吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightid}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          role.children = res.data
        })
        .catch(err => err)
    },
    async rightDialog(role) {
      this.rightDialogVisible = true
      // 把 role赋予给表单数据对象
      this.rightsForm = role
      // 把权限数据赋予给rihtsInfos成员
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsInfos = res.data
      // 接收末级权限的变量
      let arrIds = []
      this.getHaveRights(role, arrIds)
      this.defaultCheckedKeys = arrIds
    },
    // 通过递归把一个角色对应的末级权限的id获取到
    getHaveRights(node, keys) {
      if (!node.children) return keys.push(node.id)
      node.children.forEach(item => {
        return this.getHaveRights(item, keys)
      })
    },
    async clmRights() {
      //  获取全选节点id，el-tree提供, 返回数组
      let ids1 = this.$refs.rightsRef.getCheckedKeys()
      // 获取半选节点id，el-tree提供，返回数组
      let ids2 = this.$refs.rightsRef.getHalfCheckedKeys()
      // 合并ids1和ids2 ，并转换成以逗号拼接的字符串
      let allids = [...ids1, ...ids2].join(',')
      const { data: res } = await this.$http.post(
        'roles/' + this.rightsForm.id + '/rights',
        { rids: allids }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightDialogVisible = false
      this.$message.success(res.meta.msg)
      this.getRolesInfos()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px 5px;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>
