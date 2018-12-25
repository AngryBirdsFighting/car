/**
 * @Author:      qiaozp
 * @DateTime:    2018-03-21
 * @Description: 驾驶员管理组件
 */
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="姓名">
					<el-input v-model="listQuery.driverName" placeholder="请输入姓名" clearable></el-input>
				</el-form-item>
				<el-form-item label="联系电话">
					<el-input v-model="listQuery.phone" placeholder="请输入电话" clearable></el-input>
				</el-form-item>
				<el-form-item label="组织机构">
					<depart_select @deptIdChange="deptCurrentChange"></depart_select>
				</el-form-item>
				<el-form-item label="绑定状态">
					<el-select v-model="listQuery.isbind" clearable placeholder="请选择状态">
						<el-option label="已绑定" value="true"></el-option>
						<el-option label="未绑定" value="false"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.driver_add" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.driver_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
				<!--导入按钮以及弹框  start-->
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="importForm">导入</el-button> 
					<import :importVisible="importVisible" @changeImport="changeImports($event)"></import> 
				</el-form-item>				
				<!--导入按钮以及弹框  end-->
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='姓名' prop="driverName"></el-table-column>
			<el-table-column align="center" label="电话" prop="phone"></el-table-column>
			<el-table-column align="center" label="组织机构" prop="deptName"></el-table-column>
			<el-table-column align="center" label="绑定状态">
				<template slot-scope="scope">
					<div v-if="scope.row.isbind == true">
						已绑定
					</div>
					<div v-else>
						未绑定
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label='卡号' prop="cardNo"></el-table-column>
			<el-table-column align="center" label="驾龄" prop="drivingAge"></el-table-column>
			<el-table-column align="center" label="驾驶证型号" prop="licenceType"></el-table-column>
			<el-table-column align="center" label="性别">
				<template slot-scope="scope">
					<div v-if="scope.row.sex == '1'">
						男
					</div>
					<div v-else>
						女
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="年龄" prop="age"></el-table-column>
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button v-if="permBtn.driver_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.driver_Modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.driver_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		<!--新增弹框-->
		<el-dialog title="新增驾驶员" :visible.sync="addFormVisible" top="10%" width="750px" lock-scroll class="boxres dialog_input" 
			:close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm" :rules="rulesAdd" :model="addDataTemp" label-position="left" label-width="120px"
					v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="姓名：" prop="driverName">
								<el-input v-model="addDataTemp.driverName" placeholder="长度小于10" :maxlength="10" clearable></el-input>
							</el-form-item>
							<el-form-item label="年龄：" prop="age">
								<el-input v-model="addDataTemp.age" placeholder="18~70周岁" clearable></el-input>
							</el-form-item>
							<el-form-item label="电话：" prop="phone">
								<el-input v-model="addDataTemp.phone" placeholder="电话" clearable></el-input>
							</el-form-item>
							<el-form-item label="卡号：" prop="cardNo">
								<el-input v-model="addDataTemp.cardNo" placeholder="卡号" clearable></el-input>
							</el-form-item>
							<el-form-item label="驾龄：" prop="drivingAge">
								<el-input v-model="addDataTemp.drivingAge" placeholder="1~52年" clearable></el-input>
							</el-form-item>
							<el-form-item label="驾驶证类型：" prop="licenceType">
								<el-select v-model="addDataTemp.licenceType" placeholder="驾驶证类型" clearable>
									<el-option
								      	v-for="item in licenceTypeArr"
								      	:key="item.dictCode"
								      	:label="item.dictName"
								      	:value="item.dictCode">
								    </el-option>
								</el-select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="性别：">
								<el-radio v-model="addDataTemp.sex" label="1">男</el-radio>
								<el-radio v-model="addDataTemp.sex" label="2">女</el-radio>
							</el-form-item>
							<el-form-item label="组织机构" prop="deptId">
								<depart_select ref="addDepartSelect" @deptIdChange="addDeptCurrentChange"></depart_select>
							</el-form-item>
							<el-form-item label="驾驶员照片：" class="driverPhoto">
								<div class="grid-content bg-purple ">
									<el-upload
									  	class="upload-demo"
									  	drag
									  	:show-file-list="false"
									  	action="/proxy/file/upload"
									  	:on-success="handleAvatarSuccess"
								    	:before-upload="beforeAvatarUpload"
										:on-error="logoUploadError">
									  	<img v-if="imagePath" :src="imagePath" class="avatar">
									  	<i class="el-icon-upload"></i>
									  	<div class="el-upload__text">将文件拖到此处<br>或<em>点击上传</em></div>
									  	<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过2M</div>
									</el-upload>
								</div>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!--修改-->
		<el-dialog title="修改驾驶员" :visible.sync="updateFormVisible" top="10%" width="750px" lock-scroll class="boxres dialog_input"
			:close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="editDialogForm" :rules="rulesAdd" :model="editParamsTemp" label-position="left" label-width="120px"
					v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="姓名：" prop="driverName">
								<el-input v-model="editParamsTemp.driverName" placeholder="长度小于10" :maxlength="10" clearable></el-input>
							</el-form-item>
							<el-form-item label="年龄：" prop="age">
								<el-input v-model="editParamsTemp.age" placeholder="18~70周岁" clearable></el-input>
							</el-form-item>
							<el-form-item label="电话：" prop="phone">
								<el-input v-model="editParamsTemp.phone" placeholder="电话" clearable></el-input>
							</el-form-item>
							<el-form-item label="卡号：" prop="cardNo">
								<el-input v-model="editParamsTemp.cardNo" placeholder="卡号" clearable></el-input>
							</el-form-item>
							<el-form-item label="驾龄：" prop="drivingAge">
								<el-input v-model="editParamsTemp.drivingAge" placeholder="1~52年" clearable></el-input>
							</el-form-item>
							<el-form-item label="驾驶证类型：" prop="licenceType">
								<el-select v-model="editParamsTemp.licenceType" placeholder="驾驶证类型" clearable>
									<el-option
								      	v-for="item in licenceTypeArr"
								      	:key="item.dictCode"
								      	:label="item.dictName"
								      	:value="item.dictCode">
								    </el-option>
								</el-select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<template>
								<el-form-item label="性别：">
									<el-radio v-model="editParamsTemp.sex" label="1">男</el-radio>
									<el-radio v-model="editParamsTemp.sex" label="2">女</el-radio>
							  	</el-form-item>
							</template>
							<el-form-item label="组织机构" prop="deptId">
								<depart_select ref="editDepartSelect" @deptIdChange="editDeptCurrentChange"></depart_select>
							</el-form-item>
							<div class="grid-content bg-purple">
								<el-form-item label="驾驶员照片：">
									<el-upload
									  	class="upload-demo"
									  	drag
										:show-file-list="false"
									  	action="/proxy/file/upload"
									  	:on-success="handleAvatarSuccess"
								    	:before-upload="beforeAvatarUpload"
										:on-error="logoUploadError">
									  	<img v-if="imagePath" :src="imagePath" class="avatar">
									  	<i class="el-icon-upload"></i>
									  	<div class="el-upload__text">将文件拖到此处<br>或<em>点击上传</em></div>
									  	<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过2M</div>
									</el-upload>
								</el-form-item>
							</div>
						</div>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<!--查看-->
		<el-dialog title="驾驶员信息" :visible.sync="checkFormVisible" top="10%" width="750px" lock-scroll class="boxres" :close-on-click-modal="false">
			<el-form class="small-space" :model="editParamsTemp" label-position="left" label-width="120px">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="姓名：" prop="driverName">
								<strong>{{editParamsTemp.driverName}}</strong>
							</el-form-item>
							<el-form-item label="年龄：" prop="age">
								<strong>{{editParamsTemp.age}}</strong>
							</el-form-item>
							<el-form-item label="电话：" prop="phone">
								<strong>{{editParamsTemp.phone}}</strong>
							</el-form-item>
							<el-form-item label="卡号：" prop="cardNo">
								<strong>{{editParamsTemp.cardNo}}</strong>
							</el-form-item>
							<el-form-item label="驾龄：" prop="drivingAge">
								<strong>{{editParamsTemp.drivingAge}}</strong>
							</el-form-item>
							<el-form-item label="驾驶证类型：">
								<strong>{{editParamsTemp.licenceType}}</strong>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<template>
								<el-form-item label="性别：">
								  	<strong v-if="editParamsTemp.sex == 1">
										男
									</strong>
									<strong v-else>
										女
									</strong>
							  	</el-form-item>
							</template>
							<el-form-item label="组织机构：">
								<strong class="strongTipWrapNoScoll">{{deptNameCheck}}</strong>
							</el-form-item>
							<div class="grid-content bg-purple">
								<el-form-item label="驾驶员照片：">
									<img class="driver_img" :src="editParamsTemp.photo"/>
								</el-form-item>
							</div>
						</div>
					</el-col>
				</el-row>
			</el-form>
		</el-dialog>
		
	</div>
</template>

<script type="text/javascript">
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import Import from '../../components/Import'; //导入弹框组件
	import DepartSelect from '../../components/DepartSelect';
	import Pagination from '../../components/Pagination';

	export default { 
		components: {
			'import': Import,
			'depart_select':DepartSelect,
			'pagination': Pagination
		},
		data() {
			const vm =this;
			//组织机构验证
			const validateDepatTree = (rule, value, callback) => {
				var keys = "";
				if (vm.addFormVisible) { //新增
					keys = vm.addDataTemp.deptId;
				} else {//编辑
					keys = vm.editParamsTemp.deptId;
				}
				
				if (keys == "") {
					callback(new Error('请选择组织机构'));
				} else {
					callback();
				}
			};
			//卡号唯一性验证
			const validateCardNo = (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.cardNo) {
						callback();
						return;
					}
				} else {
					vm.isValidate.account = false;
				}
				
				if (value === '' || value === null) {
					callback(new Error('卡号不能为空'));
				} else {
					let param = {};
					param.cardNo = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.driverId = vm.editParamsTemp.driverId;
					}
					
					vm.$instance.post("/proxy/bizmgr/driver/uniqueCardNo", param).then(res =>{
						if(res.status == 200){
							//唯一
							if (res.data.success) { //新增提交
								callback();
							} else { //不唯一
								callback(new Error("卡号不唯一，请重新输入"));
							}
						}else{
							Message.error({message:"调用接口失败"});
							callback(new Error("调用接口失败"));
						}
					}).catch(error => {callback(new Error("调用接口失败"));});
				}
			};
			//手机号唯一性验证
			const validateDriverphone = (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.phone) {
						callback();
						return;
					}
				} else {
					vm.isValidate.account = false;
				}
				
				if (value === '' || value === null) {
					callback(new Error('手机号不能为空'));
				} else {
					let param = {};
					param.phone = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.driverId = vm.editParamsTemp.driverId;
					}
					vm.$instance.get("/proxy/bizmgr/driver/uniquePhone", {params:param}).then(res =>{
						if(res.status == 200){
							//唯一
							if (res.data.success) { //新增提交
								callback();
							} else { //不唯
								callback(new Error("手机号不唯一，请重新输入"));
							}
						}else{
							Message.error({message:"调用接口失败"});
							callback(new Error("调用接口失败"));
						}
					}).catch(error => {callback(new Error("调用接口失败"));});
				}
			};
			
			const validateDriverAge = (rule, value, callback) => {
				if( value < 18 || value > 70) {
					callback(new Error('年龄为18~70周岁'));
					return;
				} else {
					callback();
				}
			};
			
			const validateDrivingAge = (rule, value, callback) => {
				if( value < 1 || value > 52) {
					callback(new Error('驾龄为1~52年'));
					return;
				} else {
					callback();
				}
			};

			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
					driver_add: false,
					driver_delete: false, 
					driver_Modify: false, 
					driver_check: false, 
//					driver_import: false,
					driver_export: false,
				},
				
				//唯一性验证状态记录
				isValidate:{
					account: false,
					phone: false,
					isOk: false   //点击确定第一时间将此变量设置为true
				},
				
				list: [], //表格list
				total: 0,
				listLoading: true,
				height: 540,

				deptNameCheck: "", //查看需要的部门名称
				
				licenceTypeArr: [],//驾照类型数组

				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					driverName: '',
					deptId: '',
					phone: '',
					isbind: '',
				},

				//树控件数据映射关系
        		defaultProps: {
          			children: 'children',
          			label: 'deptName'
				},

				//新建数据
				addDataTemp: {
					age: "",
					cardNo: "",
					deptId: "",
					driverName: "",
					drivingAge: "",
					licenceType: "",
					phone: "",
					photo: "", 
					sex: "",
				},
				//新增、修改数据校验
				rulesAdd: {
					cardNo: [
						{ required: true, validator: validateCardNo, trigger: 'blur' }
					],
					age: [
						{ required: true, validator: validateDriverAge, trigger: 'blur'},
						{ required: true, message: '请输入年龄', trigger: 'blur' },
						{ required: true, validator: validate.validateNumber, trigger: 'blur'},
					],
					drivingAge: [
						{ required: true, validator: validateDrivingAge, trigger: 'blur'},
						{ required: true, message: '请输入驾龄', trigger: 'blur' },
						{ required: true, validator: validate.validateNumber, trigger: 'blur'},
					],
					deptId: [
						{required: true, validator: validateDepatTree}
					],
					driverName: [
						{ required: true, message: '请输入姓名', trigger: 'blur'}
					],
					phone: [
						{ required: true, validator: validate.validateTelphone, trigger: 'blur' },
						{ required: true, validator: validateDriverphone, trigger: 'blur' }
					],
					licenceType: [
						{ required: true, message: '请选择驾驶证类型', trigger: 'change'}
					]
				},
				
				//编辑数据
				editParamsTemp: {
					driverId: "",
					age: "",
					cardNo: "",
					deptId: "",
					driverName: "",
					drivingAge: "",
					licenceType: "",
					phone: "",
					photo: "", 
					sex: "",
				},
				
				//导入模板的参数
				importVisible:{
					imports: false,//弹框是否显示
					templateName: 'biz_driver',//下载模板的名称
				},
				
				imageUrl: '',
				imagePath: '',
				getImageUrl: '/proxy/file/viewImage?imagePath=',//获取image地址  参数为图片地址',//获取image地址  参数为图片地址
				addFormVisible: false,//新增弹框
				updateFormVisible: false,//修改弹框
				checkFormVisible: false,//查看弹框
				waitTime: null,
				ieImg: '',
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				this.height = height;
			});
			vm.getPerm();
			vm.getList();
			vm.getDictionaries();//获取驾照类型字典数据
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			if(this.waitTime){
				this.waitTime = clearInterval(this.waitTime); //去掉定时器的方法   同一个变量做定时器
			}
		},
		
		beforeMount: function() {
        	this.imagePath = this.getImageUrl + this.ieImg;//解决IE10第二次新增时，图片上传不显示的问题
			this.imageUrl = this.ieImg;
        },
        
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			
			//获取驾照类型字典数据
			getDictionaries(){
				const vm = this;
				utils.dictsByCode("licence_type", data => {
					vm.licenceTypeArr = data;
					vm.licenceTypeArr.sort(vm.sortArr);
				});
			},
			//排序
			sortArr(a,b){
				var codeA = a.dictCode.substr(3,a.dictCode.length),
					codeB = b.dictCode.substr(3,b.dictCode.length)
				return codeA - codeB;
			},
			
			//获取列表数据
			//isBackHome 是否返回首页
			getList(isBackHome = false) {
				if (isBackHome) {
					if (this.listQuery.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}
				var vm = this;
				vm.listLoading = true;
				//调用接口
				let param=JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/bizmgr/driver/findDriverList", param).then(res =>{
		        	vm.listLoading = false;
		          	if(res.status == 200){
		                vm.list = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	vm.listLoading = false;
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
			//新增部门选择改变
			addDeptCurrentChange(deptId){
				this.addDataTemp.deptId = deptId;
				this.$refs.addDialogForm.validateField("deptId");
			},
			//新增编辑部门选择改变
			editDeptCurrentChange(deptId){
				this.editParamsTemp.deptId = deptId;
				this.$refs.editDialogForm.validateField("deptId");
			},
			//搜索条件
			deptCurrentChange(deptId) {
				this.listQuery.deptId = deptId;
			},
			
			//新增
			handleCreate() {
				for (let i in this.addDataTemp) {  
				    this.addDataTemp[i] = '';
				} 
				this.addDataTemp.sex = "1";
				this.deptNamesAdd = "";
				this.imageUrl = "";
				this.imagePath = "";
				if (this.$refs.addDepartSelect) {
					this.$refs.addDepartSelect.deptClear();
				}
				
				this.isValidate.account = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				this.addFormVisible = true;
				this.resetForm("addDialogForm");
				
			},
			//新增确定
			handleCreateSubmit(formName) {
				this.isValidate.isOk = true;
				var vm = this;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						if (vm.imageUrl != "") {
							vm.addDataTemp.photo = vm.imageUrl;
						} else {
							Message.warning({message:"驾驶员照片未上传！"});
							return;
						}
						vm.createSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//新增提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				let param = JSON.parse(JSON.stringify(vm.addDataTemp));
				vm.$instance.post("/proxy/bizmgr/driver/addDriver", param).then(res =>{
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
					          	vm.getList(true);
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.addFormVisible = false;
					Message.error({message:"添加失败！"});
				});
			},
			
			//根据Id获取数据
			getAccountData(type, driverId) {
				let vm = this;
				let param = {};
				param.driverId = driverId;
				for (let i in vm.editParamsTemp) {  
				    vm.editParamsTemp[i] = '';
				} 
				vm.editParamsTemp.driverId = driverId;
				//调用接口
				vm.$instance.get("/proxy/bizmgr/driver/findDriverInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.editParamsTemp.age = res.data.age;
						vm.editParamsTemp.cardNo = res.data.cardNo;
						vm.editParamsTemp.driverName = res.data.driverName;
						vm.editParamsTemp.drivingAge = res.data.drivingAge;
						vm.editParamsTemp.licenceType = res.data.licenceType;
						vm.editParamsTemp.phone = res.data.phone;
						vm.editParamsTemp.sex = res.data.sex;
						
						if (type == "check") {
							vm.deptNameCheck = res.data.deptName;
							vm.editParamsTemp.photo = vm.getImageUrl + res.data.photo;
						} else { //编辑
							vm.editParamsTemp.deptId = res.data.deptId;
							vm.deptNamesEdit = res.data.deptName;
							vm.imagePath = vm.getImageUrl + res.data.photo;
							vm.editParamsTemp.photo = res.data.photo;
							if (vm.$refs.editDepartSelect) {
								vm.$refs.editDepartSelect.setCurrentSelect(vm.editParamsTemp.deptId);
							} else {
								vm.waitTime = window.setInterval(()=>{
									if (vm.$refs.editDepartSelect) {
										vm.waitTime = window.clearInterval(vm.waitTime);
										vm.$refs.editDepartSelect.setCurrentSelect(vm.editParamsTemp.deptId);
									}
								}, 100);
							}
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.checkFormVisible = false; 
					vm.updateFormVisible = false; 
					Message.error({message:"数据获取失败！"});
				});
			},
			
			//查看
			check(index, row) {
				this.checkFormVisible = true;
				this.getAccountData("check", row.driverId);
			},
			
			//修改
			handleEdit(index, row) {
				if(row.isbind){
					Message.warning({message:"此驾驶员为绑定状态，不能修改！", duration: 1500});
					return;
				}
				this.updateFormVisible = true;
				this.isValidate.account = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				this.deptNamesEdit = "";
				this.resetForm("editDialogForm");
				this.getAccountData("edit", row.driverId);
			},
			//修改确定
		    handleEditSubmit(formName) {
				var vm = this;
		    	this.isValidate.isOk = true;
		    	if (this.imageUrl != "" && this.imageUrl !== this.editParamsTemp.photo) {
					this.editParamsTemp.photo = this.imageUrl;
				} 
		    	validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.editSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//修改提交
		    editSubmit(formName) {
				var vm = this;
				vm.updateLoad = true;
				let param = JSON.parse(JSON.stringify(vm.editParamsTemp));
				vm.$instance.post("/proxy/bizmgr/driver/modifyDriver", param).then(res =>{
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
				}).catch(error => {
					vm.updateFormVisible = false;
				});
			},
			
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
      		},
      		
			//删除
			handleDelete(index, row) {
				if (row.isbind) {
					Message.warning({message:"此驾驶员被绑定，不能删除，请解绑后进行删除！", duration: 1500});
					return;
				} else {
					var vm = this;
					let param = {};
					param.driverId = row.driverId;
					//确定删除
					this.$confirm('是否删除< '+ row.driverName +' >驾驶员！', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						//调用接口
						vm.$instance.post("/proxy/bizmgr/driver/deleteDriver", param).then(res =>{
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
				}
			},
			
      		//导入
      		//打开导入文件的弹框
			importForm(){
				this.importVisible.imports = true;
			},
			//关闭导入文件弹框
			changeImports(param){
				this.importVisible.imports = param;
				this.getList(true);
			},
      		
      		//导出
      		exportFormLists() {
				utils.exportLists(this.listQuery, "/proxy/bizmgr/driver/exportDriver");
      		},
      		
      		handleAvatarSuccess(res, file) {
				this.imagePath = this.getImageUrl + res;
				this.imageUrl = res;
				this.ieImg = res;
			},
			
			//上传企业LOGO失败
			logoUploadError(err, file, fileList) {
				var vm = this;
				//编辑时上传失败
				if (vm.updateFormVisible == true) {
					this.imagePath = this.getImageUrl + this.imageUrl;
				} else {
					this.imagePath = '';
					this.imageUrl = "";
				}
				
				Message.error({message: "Logo上传失败，请重试!"});
			},
			
			beforeAvatarUpload(file) {
				const isJPG1 = file.type === 'image/png';//限制文件类型
				const isJPG2 = file.type === 'image/jpeg';
				const isLt2M = file.size / 1024 / 1024 < 2;//限制文件大小
				
				if (!isJPG1 && !isJPG2) {
					this.$message({  
                        message: '上传头像图片只能是 jpeg/png 格式!',  
                        type: 'warning' ,
                        duration: '1500'
                    });
                    return false;
				} else if(!isLt2M){
					this.$message({  
                        message: '上传文件大小不能超过 2MB!',  
                        type: 'warning',
                        duration: '1500'  
                    });
                    return false;
				} else {
					return true;
				}
			}
		}
	}
	
</script>
<style rel="stylesheet/scss" lang="scss">
	@import "src/assets/css/mixin.scss";
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
	.grid-content{
		.el-upload-dragger{
			@include size(160px, 160px);
		}
		img{
			@include size(100%, 100%);
		}
	}
	.driver_img{
		width: 180px !important;
		height: 180px !important;
	}
	.driverPhoto{
		.el-form-item__label:before {
		    content: '*';
		    color: #f56c6c;
		    margin-right: 4px;
		}
	}
</style>
