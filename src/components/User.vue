<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="querycdt.query"
            :clearable="true"
            @clear="getUserInfos"
            @keyup.enter.native="getUserInfos"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserInfos"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 添加用户对话框 -->
      <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <el-form :rules="addFormRules" ref="addFormRef" :model="addForm" label-width="80px">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item prop="mobile" label="手机号码">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 表格 -->
      <el-table :data="userInfos" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="110"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="160"></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="70">
          <!-- el-table-column包装了<slot row="rowdata"></solt> -->
          <el-switch
            v-model="userdata.row.mg_state"
            slot-scope="userdata"
            @change="changeState(userdata.row.id,userdata.row.mg_state)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <!-- 三个按钮 -->
          <template slot-scope="userdata">
            <!-- 编辑按钮 -->
            <el-tooltip content="编辑用户" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEidtDialog(userdata.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除用户" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="delUser(userdata.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 设置按钮 -->
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="fenpeiDialog(userdata.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑用户对话框 -->
      <el-dialog
        title="编辑用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form :rules="editFormRules" ref="editFormRef" :model="editForm" label-width="80px">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item prop="mobile" label="手机号码">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="fenpeiDialogVisible"
        width="50%"
        @close="fenpeiDialogClose"
      >
        <el-form
          :rules="fenpeiFormRules"
          ref="fenpeiFormRef"
          :model="fenpeiForm"
          label-width="120px"
        >
          <el-form-item prop="username" label="当前用户">{{fenpeiForm.username}}</el-form-item>
          <el-form-item prop="rid" label="分配的角色">
            <el-select v-model="fenpeiForm.rid" clearable placeholder="请选择">
              <el-option
                v-for="item in roleInfos"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="fenpeiDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="clmfenpei">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="querycdt.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="querycdt.tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserInfos()
  },
  data() {
    var checkMobile = (rule, value, callback) => {
      if (!/^1[35789]\d{9}$/.test(value)) {
        return callback(new Error('手机号格式不正确'))
      }
      callback()
    }
    return {
      keywords: '',
      // 用户数据
      userInfos: [],
      // 给获取用户数据设置查询条件
      querycdt: {
        // 查询关键字
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页获取记录条数
        pagesize: 3,
        // 总记录条数
        tot: 0
      },
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        password: [{ required: true, message: '密码必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: '',
        mobile: '',
        email: ''
      },
      editFormRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      roleInfos: [],
      fenpeiDialogVisible: false,
      fenpeiFormRules: {
        rid: [{ required: true, message: '角色必选', trigger: 'change' }]
      },
      fenpeiForm: {
        id: 0,
        username: '',
        rid: 0
      }
    }
  },
  methods: {
    // 获取用户真实列表
    async getUserInfos() {
      const { data: res } = await this.$http.get('users', {
        params: this.querycdt
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userInfos = res.data.users
      this.querycdt.tot = res.data.total
    },
    // 分页
    handleSizeChange(arg) {
      // console.log(arg) arg形参用来接收变化后的条数
      this.querycdt.pagesize = arg
      this.getUserInfos()
    },
    handleCurrentChange(arg) {
      // console.log(arg) arg形参用来接收变化后的页码
      this.querycdt.pagenum = arg
      this.getUserInfos()
    },
    // 用户状态
    async changeState(uid, state) {
      const { data: res } = await this.$http.put(
        'users/' + uid + '/state/' + state
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 添加用户对话框关闭，表单重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    // 删除用户
    delUser(id) {
      this.$confirm('确定要删除该用户吗？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          // 如果当前页只有一条数据，删除后页码 -1
          if (this.userInfos.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          this.getUserInfos()
        })
        .catch(() => {})
    },
    // 显示编辑用户对话框
    async showEidtDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
    },
    // 关闭对话框重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑
    async editUser(id) {
      const { data: res } = await this.$http.put(
        'users/' + this.editForm.id,
        this.editForm
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.editDialogVisible = false
      this.getUserInfos()
    },
    // 显示分配角色
    async fenpeiDialog(id) {
      this.fenpeiDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.fenpeiForm = res.data
      if (this.fenpeiForm.rid === 0) {
        this.fenpeiForm.rid = ''
      }
      const { data: res2 } = await this.$http.get('roles')
      if (res2.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleInfos = res2.data
    },
    clmfenpei() {
      this.$refs.fenpeiFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.fenpeiForm.id + '/role',
            this.fenpeiForm
          )
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.fenpeiDialogVisible = false
          this.getUserInfos()
          this.$message.success(res.meta.msg)
        }
      })
    },
    fenpeiDialogClose() {
      this.$refs.fenpeiFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
