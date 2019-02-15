<template>
  <div id="login-container">
    <div id="login-box">
      <div id="logo-box">
        <img src="../assets/img/logo.png" alt>
      </div>
      <el-form :rules="loginFormRules" ref="loginFormRef" :model="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username">
            <i slot="prefix" class="iconfont icon-user"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password">
            <i slot="prefix" class="iconfont icon-3702mima"></i>
          </el-input>
        </el-form-item>
        <el-row>
          <el-col :offset="15">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        uesrname: '',
        password: ''
      },
      loginFormRules: {
        username: [
          // blur:失去焦点时触发
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      // validate element提供的整体表单校验方法
      // valid 回调函数的一个参数，表示校验是否成功。返回true/false
      this.$refs.loginFormRef.validate(async valid => {
        if (valid === true) {
          // 用户信息真实性校验
          // axios 带着用户信息，去后端数据库校验
          const { data: res } = await this.$http.post('/login', this.loginForm)
          if (res.meta.status !== 200) {
            // this.$message.error 这是element message组件提供的
            return this.$message.error('用户名或密码不存在')
          }
          // 通过浏览器的sessionStorage记录服务器返回的token
          window.sessionStorage.setItem('token', res.data.token)
          // 页面重定向到后台首页(/home)
          this.$router.push('/home')
        }
      })
    },
    resetForm() {
      // resetFields element提供的整个表单重置方法
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
#login-container {
  background-color: #2b4b6b;
  height: 100%;
  overflow: hidden;
  #login-box {
    width: 450px;
    height: 304px;
    background-color: #fff;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    #logo-box {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px solid #eee;
      background-color: #fff;
      padding: 8px;
      box-shadow: 0 0 10px #eee;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .el-form {
      position: absolute;
      width: 100%;
      padding: 20px;
      bottom: 0;
      box-sizing: border-box;
    }
  }
}
</style>
