/**
 * @Author:      dousp
 * @DateTime:    2018-03-28
 * @Description: 用户组管理组件
 */
<template>
	<div>
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="用户组名称">
					<el-input v-model="listQuery.groupName" placeholder="请输入用户组名称" clearable></el-input>
				</el-form-item>
				
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
					<el-button v-if="permBtn.group_add" class="filter-item btnColor" type="primary" icon="el-icon-plus" @click="handleCreate(true)">新增</el-button>
				</el-form-item>
			</el-form>
		</div>
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading"
				element-loading-text="拼命加载中">
			<el-table-column align="center" label='用户组名称' prop="groupName"></el-table-column>
			<el-table-column align="center" label="描述" prop="description" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button v-if="permBtn.group_acount_groud" class="btn resources" @click="handleAccountGroup(scope.$index, scope.row)" title="用户分组"></el-button>
					<el-button v-if="permBtn.group_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.group_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		<!--新增弹框-->
		<el-dialog title="新增用户组" :visible.sync="addFormVisible" top="10%" width="700px" lock-scroll class="boxres dialog_input" :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm" :rules="rules" :model="addDataTemp" label-position="left" label-width="120px"
				v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="用户组名称：" prop="groupName">
								<el-input v-model="addDataTemp.groupName" :maxlength="50" placeholder="用户组名称"></el-input>
							</el-form-item>
						
								<el-form-item label="角色选择：">
								<el-select v-model="addDataTemp.roleIds" multiple clearable placeholder="请选择">
									<el-option
										v-for="item in roleList"
										:key="item.roleId"
										:label="item.roleName"
										:value="item.roleId">
									</el-option>
								</el-select>
							</el-form-item>
						
							
						</div>
					</el-col>
					<el-col :span="12">
						<el-form-item label="描述：" prop="description">
							<el-input type="textarea" :autosize="{minRows: 3, maxRows: 4}" :maxlength="500" v-model="addDataTemp.description" placeholder="描述"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
			
		<!--编辑-->
		<el-dialog title="编辑用户组" :visible.sync="updateFormVisible" top="10%" width="700px" lock-scroll class="boxres dialog_input" :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" ref="editDialogForm" :rules="rules" :model="editParamsTemp" label-position="left" label-width="120px"
				v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="用户组名称：" prop="groupName">
								<el-input v-model="editParamsTemp.groupName" :maxlength="50" placeholder="用户组名称"></el-input>
							</el-form-item>
							<el-form-item label="角色选择：">
								<el-select v-model="editParamsTemp.roleIds" multiple clearable placeholder="请选择">
									<el-option
										v-for="item in roleList"
										:key="item.roleId"
										:label="item.roleName"
										:value="item.roleId">
									</el-option>
								</el-select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<el-form-item label="描述：" prop="description">
							<el-input v-model="editParamsTemp.description" type="textarea" :maxlength="500" :autosize="{minRows: 3, maxRows: 4}" placeholder="描述"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<!--查看-->
		<el-dialog title="查看用户组" :visible.sync="checkFormVisible" top="10%" width="800px" lock-scroll class="boxres" :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" label-position="left" label-width="120px">
				<el-row>
					<el-col :span="10">
						<div class="grid-content bg-purple">
							<el-form-item label="用户组名称：">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.groupName" placement="top-start">
							      	<strong class="strongTip">{{editParamsTemp.groupName}}</strong>
							    </el-tooltip>
							</el-form-item>
							<el-form-item label="角色选择：">
								<strong>{{roleNamesCheck}}</strong>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="14">
						<el-form-item label="描述：">
							<strong class="strongTipWrap">{{editParamsTemp.description}}</strong>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-dialog>

		<!-- 用户分组 -->
		<el-dialog title="用户分组" :visible.sync="groupFormVisible" width="580px" top="10%" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" label-position="left" label-width="120px" v-loading="roleLoad" element-loading-text="拼命加载中">
				<el-transfer
					filterable
					:filter-method="transferFilterMethod"
					filter-placeholder="搜索..."
					v-model="accountGroup.accountIds"
					:titles="['未分组用户', '已分组用户']"
					:props="{key: 'accountId',label: 'account'}"
					:data="allAccountList">
				</el-transfer>
				<el-form-item class="formButton">
					<el-button @click="groupFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="groupSubmit()" class="btnColor">确 定</el-button>
				</el-form-item>
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
			//验证用户组名称唯一
			const validateGroupNameOnly = (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.groupName) {
						callback();
						return;
					}
				} else {
					vm.isValidate.groupName = false;
				}

				if (value === '' || value === null) {
					callback(new Error('账户不能为空！'));
				} else {
					let param = {};
					param.groupName = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.groupId = vm.editParamsTemp.groupId;
					}
					vm.$instance.post("/proxy/sysmgr/group/uniqueGroup", param).then(res =>{
						if(res.status == 200){
							//唯一
							if (res.data.success) {
								vm.isValidate.groupName = true;
								callback();
							} else { //不唯一
								callback("用户组名称不唯一，请重新输入！");
							}
						}else{
							callback("调用接口失败");
						}
					}).catch(error => {callback("请求失败！");});
				}
			};
			return {
				//按钮的权限
				permBtn:{
					group_add: false, 
					group_acount_groud: false, 
					group_check: false, 
					group_modify: false, 
					group_delete: false
				},

				//唯一性验证状态记录
				isValidate:{
					groupName: false,
					isOk: false   //点击确定第一时间将此变量设置为true
				},

				list: null, //表格list
				total: 0,
				listLoading: false,
				height: 540,

				deptList: [], //组织机构树数据
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					groupName: '',
				},

				//新建数据
				addDataTemp: {
					groupName: "",
					description: "",
					roleIds: []
				},
				//新增编辑数据校验
				rules: {
					groupName: [
						{ required: true, validator: validateGroupNameOnly, trigger: 'blur' }
					],
					description: [
						{ required: true, message: '请输入描述', trigger: 'blur' }
					]
				},

				//编辑数据
				editParamsTemp: {
					groupId: "",
					groupName: "",
					description: "",
					roleIds: []
				},
				roleNamesCheck: "", //查看需要的角色名称

				//角色列表数据
				roleList: [],

				//用户分组
				accountGroup:{
					accountIds: [],
					groupId: ""
				},
				allAccountList: [], // 全部组内人员数据

				addFormVisible: false,
				updateFormVisible: false,
				checkFormVisible: false,
				groupFormVisible: false,
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
				roleLoad: false,//角色赋权状态
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				this.height = height - 42;
			});
			vm.getPerm();
			vm.getList();
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
				let param=JSON.parse(JSON.stringify(vm.listQuery))
		        vm.$instance.get("/proxy/sysmgr/group/findGroupList", {params : param}).then(res =>{
					vm.listLoading = false;
		          	if(res.status == 200){
		                vm.list = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {vm.listLoading = false;});
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
				this.addDataTemp.groupName = "";
				this.addDataTemp.description = "";
				this.addDataTemp.roleIds = [];
				this.isValidate.groupName = false;
				this.isValidate.isOk = false;
				this.getRoleList();
				this.resetForm("addDialogForm");
				this.addFormVisible = true;
			},
			//新增确定
			handleCreateSubmit(formName) {
				this.isValidate.isOk = true;
				var vm = this;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						vm.createSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//新增提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				vm.$instance.post("/proxy/sysmgr/group/addGroup", JSON.parse(JSON.stringify(vm.addDataTemp))).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						vm.addFormVisible = false;	
						if (res.data.success) {
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
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.addLoad = false;Message.error({message:"添加失败！"});});	
			},
			//获取角色数据
			getRoleList() {
				if (this.roleList && this.roleList.length != 0) {
					return;
				}
				var vm = this;
				vm.$instance.get("/proxy/sysmgr/role/roleArr").then(res =>{
					if(res.status == 200){
						vm.roleList = res.data;
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {});
			},
			//穿梭过滤
			transferFilterMethod(query, item) {
          		return item.account.indexOf(query) > -1;
        	},
			//获取已分组用户
			getGroupedAccountList(groudId){
				var vm = this;
				var param = {};
				param.groupId = groudId;
				vm.$instance.get("/proxy/sysmgr/group/findGrouped", {params:param}).then(res =>{
					if(res.status == 200){
						var groupedList = res.data;
						//获取已经分组的id
						groupedList.forEach(element => {
							vm.accountGroup.accountIds.push(element.accountId);
						});
						vm.allAccountList = vm.allAccountList.concat(groupedList);
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {});
			},
			//获取未分组用户
			getUngroupedAccountList(groudId) {
				var vm = this;
				var param = {};
				param.groupId = groudId;
				vm.$instance.get("/proxy/sysmgr/group/findUngrouped", {params:param}).then(res =>{
					if(res.status == 200){
						vm.allAccountList = vm.allAccountList.concat(res.data);
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {});
			},
			//分组管理
			handleAccountGroup(index, row) {
				this.accountGroup.groupId = row.groupId;
				this.accountGroup.accountIds = [];
				this.allAccountList = [];
				this.getGroupedAccountList(row.groupId);
				this.getUngroupedAccountList(row.groupId);
				this.groupFormVisible = true;
			},
			//分组确定
			groupSubmit() {
				var vm = this;
				vm.roleLoad = true;
				vm.$instance.post("/proxy/sysmgr/group/groupManage", JSON.parse(JSON.stringify(vm.accountGroup))).then(res =>{
					if(res.status == 200){
						vm.roleLoad = false;
						if (res.data.success) {
							vm.groupFormVisible = false;
							Message.success({message: '分组成功！'});
						} else {
							Message.error({message:res.data.errorMsg});
						}
					}else{
						vm.roleLoad = false;
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.groupFormVisible = false;vm.roleLoad = false;});
			},
			//根据Id获取数据
			getGroupData(type, groupId) {
				let vm = this;
				let param = {};
				param.groupId = groupId;

				vm.editParamsTemp.description = "";
				vm.editParamsTemp.groupName = "";
				vm.editParamsTemp.roleIds = [];
				vm.roleNamesCheck = ""; 

				//调用接口
				vm.$instance.get("/proxy/sysmgr/group/findGroupInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.editParamsTemp.description = res.data.description;
						vm.editParamsTemp.groupName = res.data.groupName;
						var roles = res.data.roles;

						var rolenames = [];
						roles.forEach(element => {
							vm.editParamsTemp.roleIds.push(element.roleId);
							rolenames.push(element.roleName);
						});

						if (type == "check") {
							vm.roleNamesCheck = rolenames.toString();
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.checkFormVisible = false; vm.updateFormVisible = false; Message.error({message:"数据获取失败！"});});
			},
			//查看
			check(index, row) {
				this.getGroupData("check", row.groupId);
				this.checkFormVisible = true;
			},
			//删除
			handleDelete(index, row) {
				var vm = this;
				let param = {};
				param.groupId = row.groupId;
				//确定删除
				this.$confirm('是否删除< '+ row.groupName +' >用户组！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/sysmgr/group/deleteGroup", JSON.parse(JSON.stringify(param))).then(res =>{
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
			//修改
			handleEdit(index, row) {
				this.editParamsTemp.groupId = row.groupId;

				this.isValidate.groupName = false;
				this.isValidate.isOk = false;
				this.getRoleList();
				this.getGroupData("edit", row.groupId);

				this.updateFormVisible = true;
			},
			//修改确定
		    handleEditSubmit(formName) {
				this.isValidate.isOk = true;
				var vm = this;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						vm.editSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//修改提交
		    editSubmit() {
				var vm = this;
				vm.updateLoad = true;
				vm.$instance.post("/proxy/sysmgr/group/modifyGroup", JSON.parse(JSON.stringify(vm.editParamsTemp))).then(res =>{
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
							Message.error({message:res.data.errorMsg});
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.updateLoad = false;vm.updateFormVisible = false;});
			},
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
      		}
		}
	}
	
</script>
<style rel="stylesheet/scss" lang="scss">
	.device-imei>div>div {
		cursor: pointer;
		width: 160px;
		height: 30px;
		line-height: 30px;
		padding: 0 10px;
		color: #c0c4cc;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
	}
	
	.box .el-dialog {
		width: 25%;
	}
	
	.el-tabs__nav-wrap::after{
		background: none;
	}
	
	.el-tabs__item{
		border: 1px solid #e9e9e9;
		text-align: center;
		border-radius: 4px;
		-webkit-border-radius: 4px;
    	-moz-border-radius: 4px;
    	padding: 0 30px !important;
	}
	.el-tabs__item.is-active{
		background: #1e4d78;
		border: 1px solid #1e4d78;
		color: #fff;
	}
	.el-tabs__active-bar{
		background: none;
	}
	.box form{
		padding-left: 50px;
	}
	.dialogDeptTree {
		border: 1px solid #ddd;
		max-height: 150px;
		overflow-y: auto; 
	}
.el-select > .el-select__tags >span{
	display: inline-block;
	width: 100%!important;
}

</style>
