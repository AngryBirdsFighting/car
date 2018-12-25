/**
 * @Author:      qinbb
 * @DateTime:    2018-03-26 10:15:42
 * @Description: 组织机构
 */
<template>
	<div class="app-container manage" ref="departManage">
		<el-row>
			<el-col :span="4">
				<div class="grid-content bg-purple tree">
					<h5>组织机构管理</h5>
					<el-input placeholder="搜索组织机构" class="select-tree-input" v-model="filterText" style="margin-top:10px"></el-input>
					<div class="tree-list" ref="elTree" v-bind:style="{height: treeHeight}">
						<el-tree
							:data="treeData"
							:props="defaultProps"
							node-key="deptId"
							:expand-on-click-node="false"
							:render-content="renderContent"
							:filter-node-method="filterNode"
							@node-click="handleNodeClick"
							:default-expanded-keys = "treeDefaultOpen"
							ref="departTree"
							v-loading="treeLoad"
							element-loading-text="拼命加载中">
						</el-tree>
					</div>
				</div>
			</el-col>
			<el-col :span="20">
				<div class="grid-content  depart_table">
					<!-- 表格1 -->
					<div class="table1">
						<el-table 
						:data="deptPidList" 
						fit 
						highlight-current-row
						v-loading="listLoading"
						element-loading-text="拼命加载中">
							<el-table-column align="center" label='组织名称' prop="deptName" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="联系人" prop="contacts" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="电话" prop="phone"></el-table-column>
							<el-table-column align="center" label="邮箱" prop="email"></el-table-column>
							<el-table-column align="center" label="描述" prop="description" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="操作">
								<template slot-scope="scope">
									<el-button v-if="permBtn.depart_modify" class="btn update" size="small" 
										@click="handleEdit(scope.$index, scope.row)" title="编辑">
									</el-button>	
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div class="table2">
						<el-table 
						:data="deptIdList"
						fit highlight-current-row
						:height="tableHeight"
						v-loading="listLoading"
						element-loading-text="拼命加载中">
							<el-table-column align="center" label='组织名称' prop="deptName" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="联系人" prop="contacts" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="电话" prop="phone"></el-table-column>
							<el-table-column align="center" label="邮箱" prop="email"></el-table-column>
							<el-table-column align="center" label="描述" prop="description" show-overflow-tooltip></el-table-column>
							<el-table-column align="center" label="操作">
								<template slot-scope="scope">
									<el-button v-if="permBtn.depart_modify" class="btn update" size="small" 
										@click="handleEdit(scope.$index, scope.row)" title="编辑">
									</el-button>	
								</template>
							</el-table-column>
						</el-table>
					</div>
				</div>
			</el-col>
		</el-row>
		
		<!--新增弹框-->
		<el-dialog title="新增" :visible.sync="addFormVisible" top="10%" lock-scroll width="700px" class="boxres dialog_input" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addForm" :rules="rulesAdd" :model="addDepartData" label-position="left" label-width="120px"
			v-loading="addLoad"
			element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="组织名称：" prop="deptName">
								<el-input v-model="addDepartData.deptName" placeholder="组织名称" :maxlength="50" :title="addDepartData.deptName"></el-input>
							</el-form-item>
							<el-form-item label="电话：" prop="phone">
								<el-input v-model="addDepartData.phone" placeholder="电话"></el-input>
							</el-form-item>	
						</div>
					</el-col>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="联系人：" prop="contacts">
								<el-input v-model="addDepartData.contacts" placeholder="联系人" :maxlength="50" :title="addDepartData.contacts"></el-input>
							</el-form-item>
							<el-form-item label="邮箱：" prop="email">
								<el-input v-model="addDepartData.email" placeholder="邮箱" :maxlength="50"></el-input>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="24">
						<div class="grid-content bg-purple description">
							<el-form-item label="描述：" prop="description">
								<el-input v-model="addDepartData.description" type="textarea" placeholder="最多500字" :maxlength="500"></el-input>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="addDepartForm('addForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!--修改弹框-->
		<el-dialog title="修改" :visible.sync="updateFormVisible" top="10%" lock-scroll class="boxres dialog_input" width="700px" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" :model="addDepartData" ref="editDialogForm" :rules="rulesAdd" label-position="left" label-width="120px"
			v-loading="updateLoad"
			element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="组织名称" prop="deptName">
								<el-input v-model="addDepartData.deptName" placeholder="组织名称" :maxlength="50" :title="addDepartData.deptName"></el-input>
							</el-form-item>
									<el-form-item label="电话" prop="phone">
								<el-input v-model="addDepartData.phone" placeholder="电话"></el-input>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="联系人" prop="contacts">
								<el-input v-model="addDepartData.contacts" placeholder="联系人" :maxlength="50" :title="addDepartData.contacts"></el-input>
							</el-form-item>
							<el-form-item label="邮箱" prop="email">
								<el-input v-model="addDepartData.email" placeholder="邮箱" :maxlength="50"></el-input>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="24">
						<div class="grid-content bg-purple description">
							<el-form-item label="描述" prop="description">
								<el-input v-model="addDepartData.description" type="textarea" placeholder="描述" :maxlength="500"></el-input>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import axios from 'axios';
	import {api} from 'src/global/api';
	import { utils } from 'src/utils';
	import { validate } from 'utils/validate';
	import { Message,Loading} from 'element-ui';
	import Cookies from 'js-cookie';
	import store from '../../store'; 

	export default {
		data() {
			const vm =this;
			//验证组织机构名称唯一
			const uniqueDepart = (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.depart) {
						callback();
						return;
					}
				} else {
					vm.isValidate.depart = false;
				}

				if (value === '' || value === null) {
					callback(callback('账户不能为空！'));
				} else {
					let param = {};
					param.deptName = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.deptId = vm.addDepartData.deptId;
					}
					param = JSON.parse(JSON.stringify(param));
					vm.$instance.post("/proxy/sysmgr/depart/uniqueDepart", param).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								vm.isValidate.depart = true;
								callback();
							} else { 
								callback("组织机构名称不唯一，请重新输入！");
							}
						}else{
							callback("调用接口失败");
						}
					}).catch(error => {callback("请求失败！");});
				}				
			};
	      return {
	      	permBtn:{
				depart_add:false,//新增
				depart_delete:false,//删除
				depart_modify:false,//修改
     		},
	      	treeData: [],//树数据
	        //自定义树的属性
	        defaultProps: {
	            children: 'children',
	            label: 'deptName'
	        },
	        treeDefaultOpen: [],//默认展开的节点
	        filterText: '',//筛选车辆
	        showTreeNodeId: [],//搜索树节点
	        deptPidList: [], //组织机构上表格数据 
			deptIdList: [],//组织机构下表格数据
			deptPid: '-1',//组织机构父ID
			deptId: '',//组织机构ID

			//唯一性验证状态记录
			isValidate:{
				depart: false,
				isOk: false   //点击确定第一时间将此变量设置为true
			},

			//新增组织机构
			addDepartData:{
				deptId:'',//组织机构ID
				deptName:'',//组织机构名称
				description:'',//描述
				contacts:'',//联系人
				phone:'',//电话
				email:'',//邮箱
				deptPid:"",
			},
			//新增校验
			rulesAdd:{
				description: [
					{ required: true, message: '请输入组织描述', trigger: 'blur' }
				],
				deptName: [
					{ required: true, validator: uniqueDepart, trigger: 'blur'}
				],
				contacts: [
					{ required: true, message: '请输入联系人', trigger: 'blur' }
				],
				phone: [
					{ required: true, trigger: 'blur', validator: validate.validateTelphone}
				],
				email: [
					{ required: true, trigger: 'blur', validator: validate.isEmail}
				]
			},
			addFormVisible: false,//新增组织机构表单显示参数
			updateFormVisible: false,//修改组织机构表单显示参数
			tableHeight: '500px',//table高度
			treeHeight: '500px',
			treeLoad: false,//树的loading
			listLoading: false,//table加载状态
			addLoad: false,//新增加载状态
			updateLoad: false,//修改加载状态
			deleteState:false,//删除
	      };
	    },
	    mounted() {
	    	const vm =this;
			this.getPerm();//获取按钮权限
			utils.getTableHeight((height) => {
				let h = $('.sidebar-wrapper').height() - 20;  //左侧路由高度
				vm.$refs.departManage.style.height = h + "px";
				vm.treeHeight = h - 140 + 'px';
				vm.tableHeight = vm.treeHeight;
			});
			this.initDepart();//初始化组织机构树
		},
		//计算属性
		computed:{

		},
		watch: {
			//筛选组织机构树
	      	filterText(val) {
				this.showTreeNodeId = [];
	        	this.$refs.departTree.filter(val);
	      	}
	    },
	    //实例销毁之间调用。
		beforeDestroy(){
			//以防 修改组织机构，将store中的获取组织机构数据清空。
			this.$store.commit('SET_DEPARTDATA', []);//下拉框
			this.$store.commit('SET_DEPARTTREE', []);//弹框中的树
		},
	    methods: {
	    	//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
	    	//获取组织机构树
		    initDepart(type = ''){
		        let params = {};
		        let vm = this;
				vm.treeLoad = true;
		        //vm.$instance.get(api.departData, {param: params}).then(res =>{
		        vm.$instance.get('/proxy/sysmgr/depart/departTree', {param: params}).then(res =>{
					vm.treeLoad = false;
					if(res.status == 200){
						vm.treeData = [];
						vm.treeData = res.data;
						//新增不要要重新加载，编辑不需要修改Id
						if (type == '')
						{
							vm.deptId = vm.treeData[0].deptId;
							vm.treeDefaultOpen = [vm.deptId];
							vm.deptPid = vm.deptId;
							//获取右侧table列表数据
							vm.initDepartList();
						} else if (type == 'delete') {
							vm.initDepartList();
						} else {
							vm.treeDefaultOpen = [vm.deptId];
							if (type == 'edit') {
								vm.initDepartList();
							}
						}
						resolve();//异步操作成功
					}else{
						Message.error(res.data.errorMsg);
						
					}
		        }).catch(error => {vm.treeLoad = false;});
		    },
		    
		    //获取右侧组织机构以及子组织机构的列表数据
		    initDepartList(){
		    	const vm = this;
		    	vm.listLoading = true;
		    	const urls = ['/proxy/sysmgr/depart/findCurDepart?deptId='+vm.deptId, 
					    	  '/proxy/sysmgr/depart/findSubDepart?deptPid='+vm.deptPid];
		    	const requests = urls.map(makeRequest);
		    	// 把指定的 url 转变成 axios 请求，返回的是 Promise 对象
		        function makeRequest(url) {
		            return vm.$instance.get(url);
		        }
		        new Promise((resolve, reject) => {
		        //axios实例(instance)没有all，all是axios静态方法  等两个请求完毕后才进入到then
			        axios.all(requests).then(axios.spread(function (data1, data2) {
						//401  需要登录 
						if(data1.status == 401 || data2.status == 401) {
							Cookies.remove('refresh');//移除刷新
							vm.$store.commit('SET_USERINFO', ''); //修改用户
							router.replace({
								path: '/login'
							});
							return;
						}
						vm.listLoading = false;
			            if(data1.status == 200 && data2.status == 200){
			            	vm.deptPidList = [];
			            	vm.deptPidList.push(data1.data);
							vm.deptIdList = data2.data;
			                resolve();
			            }else{
			                Message.error({message:"调用接口失败"});
			            }
			        })).catch(error => {vm.listLoading = false;});
			    });
		    },
          	//根据搜索条件过滤树
          	filterNode(value, data) {
				if (!value) return true;
				var show = data.deptName.indexOf(value) !== -1;
				var parentShow = this.showTreeNodeId.indexOf(data.deptPid) !== -1
				if (show || parentShow) {
					this.showTreeNodeId.push(data.deptId);
				}
				return show || parentShow;
		    },
		    //树控件自定义操作按钮
		    renderContent(h, { node, data, store }) {
				if (data.deptId == this.treeData[0].deptId) {
					if(this.permBtn.depart_add){
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
								<i>
									<el-button class="add-node" type="text" title="新增" on-click={ () => this.adddepart(data) }> </el-button>
								</i>
							</span>
						);
					}else{
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
							</span>
						);
					}
				} else {
					var hasAdd = false;
					var hasDel = false;
					if(this.permBtn.depart_add) {
						hasAdd = true;
					}
					if(this.permBtn.depart_delete && data.children.length == 0){
						hasDel = true;
					}

					if(hasAdd && hasDel){
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
								<i>
									<el-button  class="add-node" type="text" title="新增" on-click={ () => this.adddepart(data) }> </el-button>
									<el-button  class="delete-node" type="text" title="删除" on-click={ () => this.delDepart(node, data) }></el-button>
								</i>
							</span>
						);
					}else if(hasAdd) {
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
								<i>
									<el-button class="add-node" type="text" title="新增" on-click={ () => this.adddepart(data) }> </el-button>
								</i>
							</span>
						);
					}else if(hasDel) {
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
								<i>
									<el-button class="delete-node" type="text" title="删除" on-click={ () => this.delDepart(node, data) }></el-button>
								</i>
							</span>
						);
					} else {
						return (
							<span class= "custom-tree-node">
								<span class="strongTree" title={node.label}>{node.label}</span>
							</span>
						);
					}					
				}
			},
			//树节点点击
			handleNodeClick(data) {
				this.deptPid = data.deptId;//组织机构父Id
				this.deptId = data.deptId;//组织机构ID
				//点击新增修改按钮不需要加载右侧tables
				if(!this.addFormVisible && !this.deleteState){
					this.initDepartList();//加载右侧表格
				}
			},
			//新增
			adddepart(data) {
				this.isValidate.isOk = false;
				this.isValidate.depart = false;
				this.addDepartData.deptPid = data.deptId;

				this.addDepartData.description = "";//描述
				this.addDepartData.deptName = "";//组织机构名称
				this.addDepartData.contacts = "";
				this.addDepartData.phone = "";
				this.addDepartData.email = "";
				this.resetForm("addForm");
				this.addFormVisible = true;
		    },
			//删除菜单
		    delDepart(node, data) {
				let vm = this;
				vm.deleteState = true;
				let param = {};
				param.deptId = data.deptId;
				let msg = "";
				if (data.children.length == 0) {
					msg = '是否删除< '+ data.deptName +' >组织机构！';
				} else {
					Message.warning({message: '有子不能删除！'});
					return;
				}
				//确定删除
				this.$confirm(msg, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/sysmgr/depart/deleteDepart", JSON.parse(JSON.stringify(param))).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								Message.success({message: '组织机构删除成功！'});
								vm.deleteState = false;
								vm.treeDefaultOpen = [data.deptPid];
								vm.deptId = data.deptPid;
								vm.deptPid = data.deptPid;
								vm.initDepart('delete');
							} else {
								vm.deleteState = false;
								Message.error({message:res.data.errorMsg});
							}						
						}else{
							vm.deleteState = false;
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {});	
				}).catch(() => {
					Message.info({message: '已取消删除'});          
				});
		    },
		    //重置表单
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
      		},
      		//新增组织机构
      		addDepartForm(param){
				var vm = this;
				this.isValidate.isOk = true;
				validate.isValidate(vm, param, (formData)=>{
					if(formData.validates){
						vm.addDeparts();
					}
					vm.isValidate.isOk = false;
				});
      		},
      		addDeparts(param){
      			const vm = this;
				let params = JSON.parse(JSON.stringify(this.addDepartData));
				delete params.deptId;
				vm.addLoad = true;
      			this.$instance.post("/proxy/sysmgr/depart/addDepart", params).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						if (res.data.success) {
				          	vm.addFormVisible = false;	
							Message({
					          showClose: true,
					          message: '新增成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){
					          	vm.initDepart('add');
								vm.initDepartList();
					          }
					        });
							resolve();//异步操作成功
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.addLoad = false;});	
      		},
      		//编辑
			handleEdit(index, row) {
				this.updateFormVisible = true;
				this.addDepartData.description = row.description;//描述
				this.addDepartData.deptId = row.deptId;//组织机构ID

				this.addDepartData.deptName = row.deptName;//组织机构名称
				this.addDepartData.contacts = row.contacts;
				this.addDepartData.phone = row.phone;
				this.addDepartData.email = row.email;

				this.isValidate.isOk = false;
				this.isValidate.depart = false;
			},
			//编辑菜单提交
			handleEditSubmit(param) {
				var vm = this;
				this.isValidate.isOk = true;
				validate.isValidate(vm, param, (formData)=>{
					if(formData.validates){
						vm.updateDeparts();
					}
					this.isValidate.isOk = false;
				});
			},
			//修改按钮提交
			updateDeparts(){
				const vm = this;
				let params = JSON.parse(JSON.stringify(this.addDepartData));
				delete params.deptPid;
				vm.updateLoad = true;
      			this.$instance.post("/proxy/sysmgr/depart/modifyDepart", params).then(res =>{
					vm.updateLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.updateFormVisible = false;	
							vm.initDepart('edit');
							Message({
					          showClose: true,
					          message: '修改成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.initDepart('edit');
								vm.initDepartList();
					          }
					        });
							resolve();//异步操作成功
						} else {
							vm.updateFormVisible = false;	
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.updateLoad = false;});	
			}
	    }
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	.depart_table{
		margin-left: 10px;
	}
	.column_height{
		margin-bottom:-3000px; 
		padding-bottom:3000px;
		background-color: #fff;
	}
	.tree{
		width: 100%;
		border-radius: 4px 4px 0 0;
		-webkit-border-radius: 4px 4px 0 0;
    	-moz-border-radius: 4px 4px 0 0;
		h5{
			margin: 0px;
			width: 100%;
			height: 47px;
			line-height: 47px;
			text-align: center;
			color: #fff;
			background: #566fc9;
			-webkit-border-radius: 4px 4px 0 0;
    		-moz-border-radius: 4px 4px 0 0;
		}
		.add-node{
			padding: 0;
			width: 14px;
			height: 20px;
			background: url(../../assets/img/tianjia.png) no-repeat center center;
			vertical-align: middle;
		}
		.delete-node{
			padding: 0;
			width: 14px;
			height: 20px;
			background: url(../../assets/img/shanchu.png) no-repeat center center;
			vertical-align: middle;
		}

	}

	//查看strong标签样式
	.strongTree {
		margin-right: 10px;
	}

	
	.manage{
		.table1{
			margin-bottom: 10px;
		}
		.tree-list{
			overflow-y: auto;
			margin-top: 10px;
		}
	}
	
</style>
