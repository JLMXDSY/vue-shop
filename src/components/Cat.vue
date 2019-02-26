<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-button type="primary" @click="catDialog">添加分类</el-button>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="catDialogVisible" width="50%" @close="catDialogClose">
        <el-form :rules="catFormRules" ref="catFormRef" :model="catForm" label-width="80px">
          <el-form-item prop="cat_name" label="分类名称">
            <el-input v-model="catForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item prop="catUpper" label="分类上级">
            <el-cascader
              expand-trigger="hover"
              :options="catInfosTwo"
              :props="catInfosTwoProps"
              v-model="selectedCat"
              @change="handleChange"
              :change-on-select="true"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="catDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="clmcat">确 定</el-button>
        </span>
      </el-dialog>
      <!-- table-tree -->
      <zk-table
        :data="catInfos"
        :columns="catInfosColumns"
        :selectionType="false"
        :expandType="false"
        :showIndex="true"
      >
        <!-- 通过作用域插槽.row可以获取到catInfos的数据 -->
        <template slot="order" slot-scope="info">
          <el-tag v-if="info.row.cat_level==0">一级</el-tag>
          <el-tag v-else-if="info.row.cat_level==1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="option" slot-scope="info">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="eidtDialog(info.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delCat(info.row.cat_id)"
          >删除</el-button>
        </template>
      </zk-table>
      <!-- 编辑分类弹框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="eidtDialogVisible"
        width="50%"
        @close="eidtDialogClose"
      >
        <el-form :rules="eidtFormRules" ref="eidtFormRef" :model="eidtForm" label-width="80px">
          <el-form-item prop="cat_name" label="分类名称">
            <el-input v-model="eidtForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="eidtDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="eidtCat">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.querycdt.pagenum"
        :page-sizes="[3, 5, 7, 9]"
        :page-size="this.querycdt.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.querycdt.total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getCatInfos()
  },
  data() {
    return {
      catInfos: [],
      querycdt: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
        total: 0
      },
      catInfosColumns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        { label: '操作', type: 'template', template: 'option' }
      ],
      catDialogVisible: false,
      catForm: {
        cat_name: '',
        cat_pid: 0, // 分类父级id
        cat_level: 0 // 分类等级
      },
      catFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 1/2级的数据信息
      catInfosTwo: [],
      // 给级联选择器节点内容配置对应信息
      catInfosTwoProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      selectedCat: [],
      eidtDialogVisible: false,
      eidtForm: {
        cat_name: '',
      },
      eidtFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获得商品分类列表数据
    async getCatInfos() {
      const { data: res } = await this.$http.get('categories/', {
        params: this.querycdt
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      console.log(res)
      this.catInfos = res.data.result
      this.querycdt.total = res.data.total
    },
    // 添加分类对话框
    async catDialog() {
      this.catDialogVisible = true
      // 获取第1/2级别上级分类信息
      const { data: res } = await this.$http.get('categories/', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      console.log(res)
      this.catInfosTwo = res.data
      this.$message.success(res.meta.msg)
    },
    catDialogClose() {
      this.$refs.catFormRef.resetFields()
      this.catDialogVisible = false
    },
    handleChange() {
      // 通过成员selectedCat(接收id数组）感知当前获取上级分类的信息情况
      if (this.selectedCat.length === 0) {
        this.catForm.cat_pid = 0
        this.catForm.cat_level = 0
      } else {
        let len = this.selectedCat.length
        this.catForm.cat_pid = this.selectedCat[len - 1]
        this.catForm.cat_level = len
      }
    },
    clmcat() {
      this.$refs.catFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(
            'categories/',
            this.catForm
          )
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.catDialogClose()
          this.getCatInfos()
        }
      })
    },
    handleSizeChange(arg) {
      this.querycdt.pagesize = arg
      this.getCatInfos()
    },
    handleCurrentChange(arg) {
      this.querycdt.pagenum = arg
      this.getCatInfos()
    },
    async eidtDialog(id) {
      this.eidtDialogVisible = true
      const { data: res } = await this.$http.get('categories/' + id)
      this.eidtForm = res.data
    },
    eidtDialogClose() {
      this.$refs.eidtFormRef.resetFields()
      this.eidtDialogVisible = false
    },
    eidtCat() {
      this.$refs.eidtFormRef.validate(async valid=>{
        if(valid){
          const {data:res} = await this.$http.put('categories/'+this.eidtForm.cat_id,this.eidtForm)
          if(res.meta.status!==200){
            return this.$message.error(res.meta.msg)
          }
          this.eidtDialogClose()
          this.getCatInfos()
          this.$message.success(res.meta.msg)
        }
      })
    },
    async delCat(id){
      this.$confirm('确认要删除该分类吗？, 删除分类', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete('categories/'+id)
          if(res.meta.status!==200){
            this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          if(this.catInfos.length===1&& this.querycdt.pagenum>1){
            this.querycdt.pagenum--
          }
          this.getCatInfos()
        }).catch(() => {});
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
</style>
