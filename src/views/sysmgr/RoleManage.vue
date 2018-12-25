/** * @Author: dousp 
 * * @DateTime: 2018-03-26
 * @Description: 角色管理
*/
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="角色名称">
					<el-input v-model="listQuery.roleName" placeholder="请输入角色名称" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" @click.native.prevent="getList(true)" icon="el-icon-search">查询</el-button>
					<el-button v-if="permBtn.role_add" class="filter-item btnColor" type="primary" @click.native.prevent="handleCreate(true)" icon="el-icon-plus">新增</el-button>
				</el-form-item>
			</el-form>
		</div>
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading"
				element-loading-text="拼命加载中">
			<el-table-column align="center" label='角色名称' prop="roleName"></el-table-column>
			<el-table-column align="center" label="角色描述" prop="roleDesc" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button v-if="permBtn.role_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.role_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.role_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!-- 新增弹窗 -->
		<el-dialog title="新增角色" :visible.sync="addDialogFormVisible" top="10%" width="500px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false" v-loading="addLoad" element-loading-text="拼命加载中">
			<el-form class="small-space" :model="addParamsTemp" ref="addRuleForm" :rules="rules" label-position="left" label-width="120px">
				<el-row>
					<el-form-item label="角色名称：" prop="roleName" class="role_dialog">
						<el-input v-model="addParamsTemp.roleName" :maxlength="50"></el-input>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="权限：">
						<div class="dialog-permissions">
							<el-tree
								ref="perTreeAdd"
								:data="menuList"
								show-checkbox
								node-key="menuId"
								:props="defaultProps"
								:default-expanded-keys="defaultOpenkeys">
							</el-tree>
						</div>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="角色描述" prop="roleDesc" class="role_dialog">
						<el-input v-model="addParamsTemp.roleDesc" type="textarea" :maxlength="200"></el-input>
					</el-form-item>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addDialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleCreateSubmit('addRuleForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 修改弹窗 -->
		<el-dialog title="修改" :visible.sync="updateFormVisible" top="10%" width="500px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false" >
			<el-form class="small-space" :model="editParamsTemp" ref="editRuleForm" :rules="rules" label-position="left" label-width="120px"
				v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-form-item label="角色名称：" prop="roleName" class="role_dialog">
						<el-input v-model="editParamsTemp.roleName" :maxlength="50"></el-input>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="权限：">
						<div class="dialog-permissions">
							<el-tree
								ref="perTreeEdit"
								:data="menuList"
								show-checkbox
								node-key="menuId"
								:props="defaultProps"
								:default-checked-keys="editParamsTemp.menuIds"
								:default-expanded-keys="defaultOpenkeys">
							</el-tree>
						</div>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="角色描述" prop="roleDesc" class="role_dialog">
						<el-input v-model="editParamsTemp.roleDesc" type="textarea" :maxlength="200"></el-input>
					</el-form-item>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editRuleForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 查看弹窗 -->
		<el-dialog title="查看" :visible.sync="checkFormVisible" top="10%" width="500px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" :model="editParamsTemp" :rules="rules" label-position="left" label-width="120px">
				<el-row>
					<el-form-item label="角色名称：">
						<strong class="strongTipWrapNoScoll">{{editParamsTemp.roleName}}</strong>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="权限：">
						<div class="dialog-permissions">
							<el-tree
								class="checkTree"
								ref="perTreeCheck"
								:data="checkMenuList"
								show-checkbox
								node-key="menuId"
								:props="defaultProps"
								:default-checked-keys="editParamsTemp.menuIds"
								:default-expanded-keys="defaultOpenkeys">
							</el-tree>
						</div>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="角色描述：">
						<strong class="strongTipWrapNoScoll">{{editParamsTemp.roleDesc}}</strong>
					</el-form-item>
				</el-row>
			</el-form>				
		</el-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import Pagination from '../../components/Pagination';

	export default {
		components: {'pagination': Pagination},
		data() {	
			const vm = this;
			//验证角色名称唯一性并提交数据
			const validateRoleNameOnly = (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.role) {
						callback();
						return;
					}
				} else {
					vm.isValidate.role = false;
				}

				if (value === '' || value === null) {
					callback(new Error('角色名称不能为空'));
				} else {
					let param = {};
					param.roleName = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.roleId = vm.editParamsTemp.roleId;
					}
					vm.$instance.post("/proxy/sysmgr/role/uniqueRole", param).then(res =>{
						if(res.status == 200){
							//唯一
							if (res.data.success) {
								vm.isValidate.role = true;
								callback();
							} else { //不唯一
								callback(new Error("角色名称不唯一，请重新输入"));
							}
						}else{
							callback(new Error("调用接口失败"));
						}
					}).catch(error => {callback(new Error("请求失败"));});
				}
			};	

			//验证新增编辑，树选择不能为空
			const validateMenuIds = (rule, value, callback) => {
				var menuIds = [];
				if (vm.addDialogFormVisible == true) { //新增
					menuIds = vm.$refs.perTreeAdd.getCheckedKeys();
				} else { //编辑
					menuIds = vm.$refs.perTreeEdit.getCheckedKeys();
				}
				if (menuIds && menuIds.length == 0) {
					callback(new Error('角色权限不能为空'));
				} else {
					callback();
				}
			};	

			return {
				//按钮的权限
				permBtn:{
					role_add: false, 
					role_delete: false, 
					role_modify: false, 
					role_check: false
				},

				//唯一性验证状态记录
				isValidate:{
					role: false,
					isOk: false   //点击确定第一时间将此变量设置为true
				},

				menuList: [],
				checkMenuList:[],
				defaultOpenkeys:[],
				//树控件数据映射关系
        		defaultProps: {
          			children: 'children',
          			label: 'menuName'
				},
				
				list: null,//表格list
				total: 0,
				listLoading: false,
				height: 540,

				//查询列表
				listQuery: {
					iDisplayStart: 0,
					iDisplayLength: 10,
					roleName: '', //角色名称
				},

				//新增参数
				addParamsTemp: {
					roleName: '', //角色名称
					roleDesc: '', //描述
					menuIds: [],//菜单id
				},
				//修改参数
				editParamsTemp: {
					roleName: '', //角色名称
					roleDesc: '', //描述
					menuIds: [],//菜单id
					roleId: ""//id
				},
				//表单验证规则
				rules: {
					roleName: [
						{ required: true, validator: validateRoleNameOnly, trigger: 'blur' }
					],
					roleDesc: [
						{ required: true, message: '请输入角色描述', trigger: 'blur' }
					]
				},

				addDialogFormVisible: false,
				checkFormVisible: false,
				updateFormVisible: false,
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				vm.height = height;
			});
			vm.getList();
			vm.getPerm();
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取列表数据
			getList(isBackHome = false) {
				var vm = this;
				if (isBackHome) {
					if (this.listQuery.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}
				vm.listLoading = true;
				//调用接口
				let param = JSON.parse(JSON.stringify(vm.listQuery));
				vm.$instance.get("/proxy/sysmgr/role/findRoleList", {params : param}).then(res =>{
					vm.listLoading = false;
					if(res.status == 200){
						vm.list = res.data.data;
						vm.total = res.data.contTotal;
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.listLoading = false;});
			},
			//获取资源树数据
			getMenuList() {
				if (this.menuList && this.menuList.length != 0) {
					return;
				}
				var vm = this;
				//调用接口
				vm.$instance.get("/proxy/sysmgr/role/findResources").then(res =>{
					if(res.status == 200){
						vm.menuList = res.data;
						vm.defaultOpenkeys = [];
						vm.checkMenuList = JSON.parse(JSON.stringify(vm.menuList));
						vm.getCheckMenuList(vm.checkMenuList);
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {this.menuList = [];Message.error({message:"菜单数据获取错误！"});});
			},
			//获取不可编辑的树数据  同时获取默认打开的节点
			getCheckMenuList(data) {
				if (data && data.length == 0) {
					return;
				}
        		var vm = this;
				$.each(data, function(idx, obj) {
					if (obj.open != null && obj.open != "" && obj.open == true) {
						vm.defaultOpenkeys.push(obj.menuId);
					}
					obj["disabled"] = true;
					vm.getCheckMenuList(obj.children);
				});
			},
			//编辑
			handleEdit(index, row) {
				this.getMenuList();
				this.editParamsTemp.roleId = row.roleId;
				this.isValidate.isOk = false;
				this.isValidate.role = false;
				this.resetForm("editRuleForm");
				this.getRoleMenuData("edit", row.roleId);

				this.updateFormVisible = true;
			},
			//根据roleId获取菜单权限数据
			getRoleMenuData(type, roleId) {
				let vm = this;
				let param = {};
				param.roleId = roleId;

				vm.editParamsTemp.roleName = "";
				vm.editParamsTemp.roleDesc = "";
				vm.editParamsTemp.menuIds = [];

				//调用接口
				vm.$instance.get("/proxy/sysmgr/role/findRoleInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.editParamsTemp.roleName = res.data.roleName;
						vm.editParamsTemp.roleDesc = res.data.roleDesc;
						vm.editParamsTemp.menuIds = res.data.menuIds;
						if (type == "check") {
							if (vm.$refs.perTreeCheck) {
								vm.$refs.perTreeCheck.setCheckedKeys(vm.editParamsTemp.menuIds);
							}
						} else { //编辑
							if (vm.$refs.perTreeEdit) {
								vm.$refs.perTreeEdit.setCheckedKeys(vm.editParamsTemp.menuIds);
							}
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"数据获取失败！"});});
			},
			//编辑提交前数据校验
			handleEditSubmit(formName) {
				var vm = this;
				this.isValidate.isOk = true;
				var entPermissionsList = this.$refs.perTreeEdit.getCheckedKeys();
				var entHalfIds = this.$refs.perTreeEdit.getHalfCheckedKeys();
				this.editParamsTemp.menuIds = entPermissionsList.concat(entHalfIds);
				
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						vm.editSubmit();
					} 
					this.isValidate.isOk = false;
				});
			},
			//编辑提交
			editSubmit() {
				var vm = this;
				vm.updateLoad = true;
				let param = JSON.parse(JSON.stringify(vm.editParamsTemp));
				vm.$instance.post("/proxy/sysmgr/role/ModifyRole", param).then(res =>{
					vm.updateLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.updateFormVisible = false;	
							Message({
					          showClose: true,
					          message: '修改成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.getList();
					          }
					        });
						} else {
							vm.updateFormVisible = false;
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						vm.updateFormVisible = false;
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.updateLoad = false;});	
			},
			//单个删除
			handleDelete(index, row) {
				var vm = this;
				let param = {};
				param.roleId = row.roleId;
				//确定删除
				this.$confirm('是否删除< '+ row.roleName +' >角色！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/sysmgr/role/deleteRole", param).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								Message.success({message: '删除成功！'});
								vm.$refs.page.deleteItemReLoadList();
							} else {
								Message.error({message:res.data.errorMsg});
							}
						}else{
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {});
				}).catch(() => {
					Message.info({message: '已取消删除'});          
				});

			},
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},
			//新增
			handleCreate() {
				this.getMenuList();
				this.addParamsTemp.roleName = "";
				this.addParamsTemp.roleDesc = "";
				this.addParamsTemp.menuIds = [];
				this.isValidate.role = false;	
				this.isValidate.isOk = false;

				this.resetForm('addRuleForm');
				if (this.$refs.perTreeAdd) {
					this.$refs.perTreeAdd.setCheckedKeys([]);
				}
				this.addDialogFormVisible = true;		
			},
			//新增提交前form数据校验
			handleCreateSubmit(formName) {
				var vm = this;
				this.isValidate.isOk = true;
				var entPermissionsList = this.$refs.perTreeAdd.getCheckedKeys();
				var entHalfIds = this.$refs.perTreeAdd.getHalfCheckedKeys();
				this.addParamsTemp.menuIds = entPermissionsList.concat(entHalfIds);

				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						vm.createSubmit();
					}
					this.isValidate.isOk = false;					
				});
			},
			//新增提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				let param = JSON.parse(JSON.stringify(vm.addParamsTemp));
				vm.$instance.post("/proxy/sysmgr/role/addRole", param).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.addDialogFormVisible = false;	
							Message({
					          showClose: true,
					          message: '新增成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){
					          	vm.getList(true);
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败!"});
					}
				}).catch(error => {vm.addLoad = false;Message.error({message:"添加失败！"});});	
			},
			//查看
			check(index, row){
				this.getMenuList();
				
				this.getRoleMenuData("check", row.roleId);
				this.checkFormVisible = true;
			},
			//重置表单
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
      		}
		}
	};
</script>
<style rel="stylesheet/scss" scope lang="scss">
  /*.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  } 
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 155px;
    height: 125px;
    line-height: 125px;
    text-align: center;
  }
  .avatar, .logo-img {
    width: 155px;
    height: 125px;
    display: block;
  }*/
  .pass-form>.el-dialog{
  	width: 600px;
  }
  .pass-form>.el-dialog .el-input__icon{
  		line-height: 30px;
  	}
  .dialog-permissions {
	  max-height: 250px;
	  overflow-y:auto;
  }
  .splitter-line {
	  height:1px;
	   background:#ddd;
	   margin-bottom:10px;
  }
  .checkTree .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
	  	border-color: #444;
	}
  
</style>