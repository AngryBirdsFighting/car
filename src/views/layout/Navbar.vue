/**
 * @Author:      qinbb
 * @DateTime:    2018-02-01 11:07:40
 * @Description: 整体布局框架中的头部 以及修改密码 退出登录  修改主题颜色
 */
<template>
  <div class="navbar">
    <el-row>
      <el-col :span="4">
        <div class="grid-content bg-purple header-col">
          <div class="logo">
            <img v-if="userInfo.entLogo" :src="userInfo.entLogo" class="avatar">
          <img v-else src="../../assets/img/logo.png">
          <span>车联网业务平台</span>
          </div>
          
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content bg-purple-light">
         <header-slider-bar></header-slider-bar>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="grid-content bg-purple header-col">
            <ul class="header-right">
              <li class="fr">
                <el-dropdown class="avatar-container" trigger="click">
                  <div class="avatar-wrapper">
                    <img src="../../assets/img/login-peo.png">
                    <span v-if="userInfo.nick">{{userInfo.nick}}</span>
                    <span v-else>管理员</span>
                    <i class="el-icon-caret-bottom"></i>
                  </div>
                  <el-dropdown-menu class="user-dropdown" slot="dropdown">
                    <router-link class="inlineBlock" to="/user/Personal">
                      <el-dropdown-item>个人资料</el-dropdown-item>
                    </router-link>
                    <el-dropdown-item class="change-pass">
                      <span @click="dialogFormVisible = true">修改密码</span>
                    </el-dropdown-item>
                       <el-dropdown-item class="change-pass">
                       <span @click="logout">退出</span>
                    </el-dropdown-item>
                    <!-- <el-dropdown-item>
                      <span @click="dialogVisible = true">切换主题</span>
                    </el-dropdown-item> -->
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
            </ul>
        </div>
      </el-col>
    </el-row>
    <!-- 修改密码弹窗 -->
    <el-dialog
      title="密码修改"
      class="passDialog"
      :visible.sync="dialogFormVisible"
      top="15%"
      width="25%"
      height="400px"
      @close="cancel"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        class="small-space"
        :model="passwordForm"
        :rules="passwordFormRules"
        ref="passwordForms"
        label-position="right"
        label-width="100px"
        style="width: 400px; "
        v-loading="updateLoad"
        element-loading-text="拼命加载中"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="重复新密码" prop="newPassword2">
          <el-input type="password" v-model="passwordForm.newPassword2" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item class="dialog-footer">
          <el-button @click="cancel" style="margin-bottom: 20px;">取 消</el-button>
          <el-button @click="resetForm('passwordForms')" style="margin-bottom: 20px;">重置</el-button>
          <el-button
            type="primary"
            @click.native.prevent="handlePwdModifySubmit('passwordForms')"
            style="margin-bottom: 20px;"
          >确 定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 换肤弹窗 -->
    <!--<el-dialog title="更改主题颜色" :visible.sync="dialogVisible" >
              <el-form class="small-space" label-position="left" label-width="130px" style='width: 400px; margin-left:65px;'>
                <el-form-item label="请选择主题颜色：" prop="resource">
                   <el-radio-group v-model="themeValue">
                        <el-radio label="blue">蓝色</el-radio>
                        <el-radio label="green">绿色</el-radio>
                        <el-radio label="red">红色</el-radio>
                   </el-radio-group>
                 </el-form-item>
              </el-form>

              <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleChangeTheme">确 定</el-button>
              </div>
    </el-dialog>-->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Cookies from "js-cookie";
import { validate } from "src/utils/validate";
import { api } from "src/global/api";
import { Message } from "element-ui";
import HeaderSliderBar from "./HeaderSliderBar.vue"

export default {
  //局部注册组件
  components: {},
  //data是函数
  data() {
    const vm = this;
    //验证新旧密码不一致
    const validateOldPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入重置密码"));
      } else if (value === vm.passwordForm.oldPassword) {
        callback(new Error("新旧密码应该不一样"));
      } else {
        if (vm.passwordForm.newPassword2 !== "") {
          vm.$refs.passwordForms.validateField("newPassword2"); //对部分表单字段进行校验的方法
        }
        callback();
      }
    };
    //验证密码
    const validateNewPassword2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== vm.passwordForm.newPassword) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };

    //返回的对象
    return {
      //   activeIndex: "1",
      activeIndex2: "1-1",
      dialogVisible: false, //切换主题
      dialogFormVisible: false, //修改密码
      themeValue: localStorage.getItem("themeValue")
        ? localStorage.getItem("themeValue")
        : "blue", //主题颜色
      passwordForm: {
        //密码
        oldPassword: "",
        newPassword: "",
        newPassword2: ""
      },
      //密码规则
      passwordFormRules: {
        oldPassword: [
          { required: true, trigger: "blur", message: "旧密码不能为空" },
          { required: true, trigger: "blur", validator: validate.validatePass }
        ],
        newPassword: [
          { required: true, trigger: "blur", message: "新密码不能为空" },
          { required: true, trigger: "blur", validator: validateOldPassword },
          { required: true, trigger: "blur", validator: validate.validatePass }
        ],
        newPassword2: [
          { required: true, trigger: "blur", message: "重复密码不能为空" },
          { required: true, trigger: "blur", validator: validateNewPassword2 },
          { required: true, trigger: "blur", validator: validate.validatePass }
        ]
      },
      updateLoad: false
    };
  },
  components:{
    "header-slider-bar": HeaderSliderBar
  },
  //计算属性
  computed: {
    //mapGetters工具函数 使用对象展开运算符（...）  会将store中的sidebar、userInfo映射到局部计算属性中
    //如果你要将getter映射为不同的名称，请使用一个对象： 默认名称一样的是[]
    ...mapGetters(["sidebar", "userInfo"])
  },
  //生命周期钩子函数 el被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子
  mounted() {
    var vm = this;
  },
  //一般是自定义的方法
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    //换肤
    /*handleChangeTheme(){
             var vm = this;
             global.changeTheme(vm.themeValue);
             this.dialogVisible = false;
         },*/
    //修改密码
    handlePwdModifySubmit(formName) {
      var vm = this;
      validate.isValidate(vm, formName, formData => {
        if (formData.validates) {
          vm.updateLoad = true;
          //                  console.log('修改密码入参：', vm.passwordForm);
          let param = {};
          param.oldpassword = vm.passwordForm.oldPassword;
          param.password = vm.passwordForm.newPassword2;
          vm.$instance
            .post("/proxy/sysmgr/account/modifyPassword", param)
            .then(res => {
              vm.updateLoad = false;
              if (res.status == 200) {
                //修改密码
                if (res.data.success) {
                  Message.success({ message: res.data.errorMsg });
                  Cookies.set("password", ""); //cookies保存修改密码
                  vm.$store.commit("SET_PWD", ""); //state修改密码
                  vm.dialogFormVisible = false;
                  vm.resetForm(formName);
                  //跳回登录
                  window.setTimeout(function() {
                    vm.logout();
                  }, 500);
                } else {
                  Message.error({ message: res.data.errorMsg });
                  // vm.resetForm(formName);
                }
              } else {
                Message.error({ message: "调用接口失败" });
              }
            })
            .catch(error => {});
        }
      });
    },
    //退出登录
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // 为了重新实例化vue-router对象 避免bug
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    cancel() {
      this.dialogFormVisible = false;
      this.resetForm("passwordForms");
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" >
@import "src/assets/css/mixin.scss";
.avatar {
  -webkit-border-radius: 10px;
  border-radius: 10px;
}
.el-menu--horizontal {
  border: none !important;
}
.navbar {
  @include height(60px);
  // padding: 0 20px;
  background: $HeaderBackgroundColor;
  border-radius: 0px !important;
  // position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  li.fl {
    outline: none;
  }
  .logo {
    margin-left: 20px;
    img {
      width: 40px;
      // height: 30px;
      margin-right: 10px;
      float: left;
      margin-top: 10px;
    }
    span {
      color: #fff;
      display: inline-block;
      @include height(60px);
      font-size: 20px;
    }
  }
  .hamburger-container {
    @include height(60px);
    float: left;
    padding: 0 10px;
  }
  .errLog-container {
    display: inline-block;
    position: absolute;
    right: 165px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .nav_right {
    position: relative !important;
    z-index: 2000;
    width: 300px;
    font-size: 14px;
    color: #d2d9f4;
    outline: none;
    padding-top: 20px;
    li {
      @include height(20px);
      border-left: 1px solid #d2d9f4;
      padding: 0 15px;
      cursor: pointer;
      &:hover {
        color: #fff;
      }
    }
  }
  .avatar-wrapper {
    outline: none;
    color: #d2d9f4;
    &:hover {
      color: #fff;
    }
  }
  .popper__arrow {
    left: 50% !important;
  }
}
.passDialog {
  .small-space > div {
    margin-left: 65px;
  }
  .small-space > .dialog-footer {
    margin-left: 0;
  }
}
.change-pass {
  padding: 0;
  text-align: center;
  span {
    display: inline-block;
    width: 100%;
  }
}
.el-menu--horizontal > .el-submenu .el-submenu__title {
  height: 60px;
  line-height: 60px;
}
.el-submenu__title i {
    color: #fff;
}
.header-col {
  padding-right: 34px;
    height: 60px;
    color: white;
}
.header-col li{
  line-height: 60px
}
.header-right{
  font-size: 14px
}
.avatar-container{
  cursor: pointer;
}
// .el-menu--popup-bottom-start{
//   margin-top: 0;
// }
</style>



