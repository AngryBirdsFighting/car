/**
 * @Author:      qiaozp
 * @DateTime:    2018-07-13 14:40:07
 * @Description: 拍照作业组件
 */
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="任务名称">
					<el-input  v-model="listQuery.snapName" placeholder="请输入任务名称" clearable></el-input>
				</el-form-item>
				<el-form-item label="任务类型">
					<el-select v-model="listQuery.snapType" clearable placeholder="请选择任务类型">
						<el-option label="请选择" value=""></el-option>
						<el-option label="固定时间" value="1"></el-option>
						<el-option label="分钟间隔" value="2"></el-option>
						<el-option label="小时间隔" value="3"></el-option>
					</el-select>					 
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item class="fr">
					<el-button v-if="permBtn.add_photo_job" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='任务名称' prop="snapName" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="任务类型" width="150">
				<template slot-scope="scope">
					<div v-if="scope.row.snapType == 1">
						固定时间
					</div>
					<div v-if="scope.row.snapType == 2">
						分钟间隔
					</div>
					<div v-if="scope.row.snapType == 3">
						小时间隔
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="任务执行时间" prop="snapVal" width="200">
				<template slot-scope="scope">
					<div v-if="scope.row.snapType == 1">
						{{scope.row.snapVal}}
					</div>
					<div v-if="scope.row.snapType == 2">
						间隔{{scope.row.snapVal}}分钟
					</div>
					<div v-if="scope.row.snapType == 3">
						间隔{{scope.row.snapVal}}小时
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="创建时间" prop="createTime" width="200"></el-table-column>
			<el-table-column align="center" label='描述' prop="snapDescribe" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<template slot-scope="scope">
					<el-button v-if="permBtn.snap_photo_job" class="btn rules" size="small" title="拍照作业分配" @click="setSnapJob(scope.$index, scope.row)"></el-button>
					<el-button v-if="permBtn.find_photo_job" class="btn check" size="small" title="查看" @click="check(scope.$index, scope.row)"></el-button>
					<el-button v-if="permBtn.modify_photo_job" class="btn update" size="small" title="修改" @click="handleEdit(scope.$index, scope.row)"></el-button>
					<el-button v-if="permBtn.delete_photo_job" class="btn delete" size="small" title="删除" @click="handleDelete(scope.$index, scope.row)"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!--新增-->
		<el-dialog title="拍照作业新增" :visible.sync="addFormVisible" top="10%" width="750px" lock-scroll class="boxres dialog_input" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm" :rules="validateRules" :model="addDataTemp" label-position="left" label-width="140px" v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="24">
						<el-form-item label="任务名称：" prop="snapName">
							<el-input v-model="addDataTemp.snapName" placeholder="最多50字" :maxlength="50"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务类型：" prop="snapType">
							<el-select v-model="addDataTemp.snapType" placeholder="请选择任务类型" @change="changeType('add')">
								<el-option label="固定时间" value="1"></el-option>
								<el-option label="分钟间隔" value="2"></el-option>
								<el-option label="小时间隔" value="3"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务执行时间：" prop="snapVal">
							<el-time-picker v-show="addDataTemp.snapType == 1" ref="snapDate" v-model="addDataTemp.snapVal" placeholder="请选择执行时间" value-format="HH:mm" format="HH:mm" style="width: 160px;"></el-time-picker>
							<el-select v-show="addDataTemp.snapType == 2" v-model="addDataTemp.snapVal" placeholder="请选择执行间隔">
								<el-option
							      	v-for="item in dictionaries.minutes_interval"
							      	:key="item.dictCode"
							      	:label="item.dictName"
							      	:value="item.dictCode">
							    </el-option>
							</el-select>
							<el-select v-show="addDataTemp.snapType == 3" v-model="addDataTemp.snapVal" placeholder="请选择执行间隔">
								<el-option
							      	v-for="item in dictionaries.hour_interval"
							      	:key="item.dictCode"
							      	:label="item.dictName"
							      	:value="item.dictCode">
							    </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="任务描述：" prop="snapDescribe">
							<el-input type="textarea" v-model="addDataTemp.snapDescribe" :autosize="{minRows: 5, maxRows: 5}" placeholder="请输入拍照任务描述" style="width: 90%;"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!--修改-->
		<el-dialog title="拍照作业修改" :visible.sync="updateFormVisible" top="10%" width="750px" lock-scroll class="boxres dialog_input" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="editDialogForm" :rules="validateRules" :model="editParamsTemp" label-position="left" label-width="140px" v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="24">
						<el-form-item label="任务名称：" prop="snapName">
							<el-input v-model="editParamsTemp.snapName" placeholder="请输入任务名称"></el-input>
						</el-form-item>
						
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务类型：" prop="snapType">
							<el-select v-model="editParamsTemp.snapType" placeholder="请选择任务类型" @change="changeType('edit')">
								<el-option label="固定时间" value="1"></el-option>
								<el-option label="分钟间隔" value="2"></el-option>
								<el-option label="小时间隔" value="3"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务执行时间：" prop="snapVal">
							<el-time-picker v-show="editParamsTemp.snapType == 1" v-model="editParamsTemp.snapVal" placeholder="请选择执行时间" value-format="HH:mm" format="HH:mm" style="width: 160px;"></el-time-picker>
							<el-select v-show="editParamsTemp.snapType == 2" v-model="editParamsTemp.snapVal" placeholder="请选择执行间隔">
								<el-option
							      	v-for="item in dictionaries.minutes_interval"
							      	:key="item.dictCode"
							      	:label="item.dictName"
							      	:value="item.dictCode">
							    </el-option>
							</el-select>
							<el-select v-show="editParamsTemp.snapType == 3" v-model="editParamsTemp.snapVal" placeholder="请选择执行间隔">
								<el-option
							      	v-for="item in dictionaries.hour_interval"
							      	:key="item.dictCode"
							      	:label="item.dictName"
							      	:value="item.dictCode">
							    </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="任务描述：" prop="snapDescribe">
							<el-input type="textarea" v-model="editParamsTemp.snapDescribe" :autosize="{minRows: 5, maxRows: 5}" placeholder="请输入拍照任务描述" style="width: 90%;"></el-input>
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
		<el-dialog title="拍照作业详情" :visible.sync="checkFormVisible" top="10%" width="750px" lock-scroll class="boxres dialog_input" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm" :model="editParamsTemp" label-position="left" label-width="120px" v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="24">
						<el-form-item label="任务名称：" prop="snapName">
							<strong>{{editParamsTemp.snapName}}</strong>
						</el-form-item>
						
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务类型：" prop="snapType">
							<strong v-if="editParamsTemp.snapType == 1">
								固定时间
							</strong>
							<strong v-if="editParamsTemp.snapType == 2">
								分钟间隔
							</strong>
							<strong v-if="editParamsTemp.snapType == 3">
								小时间隔
							</strong>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="任务执行时间：" prop="snapVal">
							<strong></strong>
							<strong v-if="editParamsTemp.snapType == 1">
								{{editParamsTemp.snapVal}}
							</strong>
							<strong v-if="editParamsTemp.snapType == 2">
								间隔{{editParamsTemp.snapVal}}分钟
							</strong>
							<strong v-if="editParamsTemp.snapType == 3">
								间隔{{editParamsTemp.snapVal}}小时
							</strong>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="任务描述：" prop="snapDescribe">
							<span class="strongTipWrap">{{editParamsTemp.snapDescribe}}</span>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-dialog>
		
		<!--拍照作业分配-->
		<el-dialog title="拍照作业分配" :visible.sync="configFormVisible" top="10%" width="850px" lock-scroll class="boxres dialog_input" 
				:close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog">
			<div class="filter-container">
	            <el-form :inline="true" :model="snapJobCarList" class="demo-form-inline">
	                <el-form-item label="状态">
		                <el-select v-model="snapJobCarList.config" @change="changeBtn">
		                    <el-option label="已分配" value="1"></el-option>
		                    <el-option label="未分配" value="-1"></el-option>
		                </el-select>
	                </el-form-item>
	                <el-form-item label="部门">
	                  	<depart_select ref="queryDept" @deptIdChange="deptCurrentChange"></depart_select>
	                </el-form-item>
	                <el-form-item label="车牌号">
	                  	<el-input v-model="snapJobCarList.carNum" placeholder="请输入车牌号" clearable></el-input>
	                </el-form-item>
	                <el-form-item>
	                  	<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click.native.prevent="initTable(true)">查询</el-button>
	                </el-form-item>
	            </el-form>
            </div>
            <el-table :data="configList" :height="300" @selection-change="handleSelectionChange" fit highlight-current-row  v-loading="listLoading" element-loading-text="拼命加载中">
              	<el-table-column align="center" type="selection"></el-table-column>
              	<el-table-column align="center" label="车牌号" prop="carNum"></el-table-column>
              	<el-table-column align="center" label="部门名称" prop="deptName"></el-table-column>
              	<el-table-column v-if="isMakedConfig" align="center" label="任务名称" prop="snapName"></el-table-column>
            </el-table>
            <!-- 分页 -->
	        <div class="marginTop10">
	            <pagination ref="configPage" :total="configTotal" @reLoadData="snapPaginationChange"></pagination>
	        </div>
	        <div class="formButton">
	        	<el-button class="filter-item btnColor" type="primary" @click.native.prevent="closeDialog">关闭</el-button>
	            <el-button class="filter-item btnColor" type="primary"  @click.native.prevent="setConfig">{{changeBtnName}}</el-button>
	          </div>
		</el-dialog>
		
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import {api} from 'src/global/api';
	import { utils } from 'src/utils';
	import { Message } from 'element-ui';
	import DepartSelect from '../../components/DepartSelect';
	import Pagination from '../../components/Pagination';
	import { validate } from 'utils/validate';

	export default {
		components: {
			'depart_select':DepartSelect,
			'pagination': Pagination
		},
	    // 声明 props
		data() {
			const vm =this;
			//新增页面密码校验
			const validateSnapVal = (rule, value, callback) => {
				var val = "";
				var isData = false;
				if (vm.addFormVisible) {
					//新增
					val = vm.addDataTemp.snapVal;
					if (vm.addDataTemp.snapType == "1") {
						isData = true;
					}
				} else {
					//编辑
					val = vm.editParamsTemp.snapVal;
					if (vm.editParamsTemp.snapType == "1") {
						isData = true;
					}
				}

				if (!val || val === '') {
					if (isData) {
						callback(new Error('请选择任务执行时间'));
					} else {
						callback(new Error('请选择任务执行时间间隔'));
					}
				} else {
					callback();
				}
			};
			
	     	return {
	     		permBtn:{
					add_photo_job: false,//新增
					delete_photo_job: false,//删除
					find_photo_job: false,//查看
					modify_photo_job: false,//修改
					snap_photo_job: false//拍照作业分配
	     		},
				listLoading: false,//table加载中
				carListLoading: false,//table加载中
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
				configLoad: false,
				
				height: 670,
				list: [],//table列表
				total: 0,
				
				addFormVisible: false,//新增弹框
				updateFormVisible: false,//修改弹框
				checkFormVisible: false,//查看弹框
				configFormVisible: false,//拍照作业分配弹框
				
				//树控件数据映射关系
		        defaultProps: {
		          children: 'children',
		          label: 'deptName'
		        },
		        deptNames: '',//组织机构名称
		        deptList: [],//组织机构树
				//拍照作业列表列表参数
				listQuery:{
	     			iDisplayLength: 10,
					iDisplayStart: 0,
					snapName: '',//任务名称
					snapType: null//任务类型
	     		},
	     		
	     		//新增
				addDataTemp:{
					snapName: '',//拍照任务名称
					snapType: '1',//拍照任务类型
					snapVal: '',//拍照任务数据
					snapDescribe: ''//拍照任务描述
				},
	     		
	     		//根据ID查看数据
	     		editParamsTemp: {
	     			snapId: '',
	     			snapName: '',
	     			snapType: '',
	     			snapVal: '',
	     			snapDescribe: ''
	     		},
	     		
	     		configList: [],//拍照作业车辆列表
				configTotal: 0,
				//拍照作业车辆列表参数
	     		snapJobCarList: {
	     			iDisplayLength: 10,
					iDisplayStart: 0,
					carNum: '',//车牌号
					deptId: '',//部门ID
					config: '-1',//分配状态
					snapId: ''//任务ID
	     		},
				//拍照作业分配数据
	     		configData:{
	     			carIds: [],//车辆ID数组
			        snapId: '',//任务ID
			        type: '',//操作类型 1：绑定 2：取消
	     		},
	     		//数据字典
                dictionaries:{},
                //新增、修改数据校验
				validateRules: {
					snapName: [
						{ required: true, message: '请输入任务名称', trigger: 'blur' }
					],
					snapType: [
						{ required: true, message: '请选择任务类型', trigger: 'blur' },
					],
					snapVal: [
						{required: true, validator: validateSnapVal, trigger: 'change' },
					],
					snapDescribe: [
						{ required: true, message: '请输入任务描述', trigger: 'blur'}
					]
				},
				changeBtnName:'确定分配',
				isMakedConfig: false,
	      	};
	    },
	    mounted() {
	    	var vm = this;
			utils.getTableHeight((height)=>{
				vm.height = height;
			});
			vm.getPerm();//权限
			vm.getList();//表格
			vm.getDictionaries();//获取数据字典数据
	    },
	    //计算属性
		computed:{
			
		},
		watch: {
			
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取字典
			getDictionaries() {
				var vm = this;
				let arr = ["hour_interval","minutes_interval"];
				utils.batchDictsByCode(arr, data => {
					vm.dictionaries = data;
					vm.splitParamVal(vm.dictionaries["hour_interval"]);
					vm.splitParamVal(vm.dictionaries["minutes_interval"]);

                    vm.dictionaries["hour_interval"].sort(vm.sortArr);
					vm.dictionaries["minutes_interval"].sort(vm.sortArr);
				});
			},
			//排序
			sortArr(a,b){
				var codeA = a.dictCode,
					codeB = b.dictCode;
				return codeA - codeB;
			},
			//分隔时间
			splitParamVal(dicts) {
				dicts.forEach(element => {
					element.dictCode = element.dictCode.split("_")[2];
				});
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
		        vm.$instance.post("/proxy/bizmgr/snapJob/findSnapJobList", param).then(res =>{
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
			snapPaginationChange(pageData) {
				this.snapJobCarList.iDisplayStart = pageData.iDisplayStart;
				this.snapJobCarList.iDisplayLength = pageData.iDisplayLength;
				this.initTable();
			},
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
      		},
      		
      		//任务类型改变时触发
			changeType(FormType) {
				let vm = this;
				if (FormType == 'add') {
					vm.addDataTemp.snapVal = '';
					this.$refs.addDialogForm.validateField("snapVal");
				} else if (FormType == 'edit'){
					vm.editParamsTemp.snapVal = '';
					this.$refs.editDialogForm.validateField("snapVal");
				}
			},
			
			//新增
			handleCreate() {
				this.addDataTemp.snapName = "";
				this.addDataTemp.snapType = "1";
				this.addDataTemp.snapVal = "";
				this.addDataTemp.snapDescribe = "";
				this.addFormVisible = true;
				this.resetForm("addDialogForm");
				if (this.$refs.addDialogForm) {
					this.$refs.addDialogForm.clearValidate();
				}
			},
			//新增确定
			handleCreateSubmit(formName) {
				var vm = this;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						vm.createSubmit();
					}
				});
			},
			//新增提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				vm.$instance.post("/proxy/bizmgr/snapJob/addSnapJob", JSON.parse(JSON.stringify(vm.addDataTemp))).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.addFormVisible = false;	
							Message({
					          	showClose: true,
					          	message: '新增成功',
					          	type: 'success',
					          	duration: 1500 ,
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
					vm.addLoad = false;
					Message.error({message:"添加失败！"});
				});
			},
			//删除
			handleDelete(index, row) {
				var vm = this;
				let param = {};
				param.snapId = row.snapId;
				//确定删除
				this.$confirm('是否删除< '+ row.snapName +' >拍照作业！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.get("/proxy/bizmgr/snapJob/deleteSnapJob", {params:param}).then(res =>{
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
			
			//根据Id获取数据
			getSnapJobInfo(snapId) {
				let vm = this;
				let param = {};
				param.snapId = snapId;
				for (let i in vm.editParamsTemp) {  
				    vm.editParamsTemp[i] = '';
				} 
				vm.editParamsTemp.snapId = snapId;
				//调用接口
				vm.$instance.get("/proxy/bizmgr/snapJob/findSnapJobInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.editParamsTemp.snapId = res.data.snapId;
						vm.editParamsTemp.snapName = res.data.snapName;
						vm.editParamsTemp.snapType = res.data.snapType.toString();//number转字符串
						vm.editParamsTemp.snapVal = res.data.snapVal;
						vm.editParamsTemp.snapDescribe = res.data.snapDescribe;
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
				this.getSnapJobInfo(row.snapId);
			},
			
			//修改
			handleEdit(index, row) {
				this.updateFormVisible = true;
				this.resetForm("editDialogForm");
				if (this.$refs.editDialogForm) {
					this.$refs.editDialogForm.clearValidate();
				}
				this.getSnapJobInfo(row.snapId);
			},
			//修改确定
		    handleEditSubmit(formName) {
				var vm = this;
		    	validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.editSubmit();
					}
				});
			},
			//修改提交
		    editSubmit(formName) {
				var vm = this;
				vm.updateLoad = true;
				vm.$instance.post("/proxy/bizmgr/snapJob/modifySnapJob", JSON.parse(JSON.stringify(vm.editParamsTemp))).then(res =>{
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
					vm.updateLoad = false;
					vm.updateFormVisible = false;
				});
			},
			
			//拍照作业分配
			setSnapJob(index, row) {
				let vm = this;
				vm.configFormVisible = true;
				vm.configData.snapId = row.snapId;
				vm.snapJobCarList.snapId = row.snapId;
				vm.configData.type = 1;
				vm.initTable(true);
			},
			
			//拍照作业搜索条件
			deptCurrentChange(deptId) {
				this.snapJobCarList.deptId = deptId;
			},
			
			initTable(isBackHome = false) {
				if (isBackHome) {
					if (this.snapJobCarList.iDisplayStart != 0) {
						this.$refs.configPage.backFirstPage();
						return;
					}
				}
				var vm = this;
				//调用接口
				let param = JSON.parse(JSON.stringify(vm.snapJobCarList));

		        vm.$instance.post("/proxy/bizmgr/snapJob/findSnapJobCarList", param).then(res =>{
		        	vm.listLoading = false;
		         	if(res.status == 200){
		                vm.configList = res.data.data;
						vm.configTotal = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	vm.listLoading = false;
		        });
			},
			
			//状态改变
			changeBtn() {
				if(this.snapJobCarList.config == '1') {//-1 未分配 1 已分配
					this.isMakedConfig = true;
					this.changeBtnName = '取消分配';
					this.configData.type = 2; //1：绑定 2：取消
				} else if(this.snapJobCarList.config == '-1') {
					this.isMakedConfig = false;
					this.changeBtnName = '确定分配';
					this.configData.type = 1;
				}
				this.initTable(true);
			},
			
			//table复选框选中
			handleSelectionChange(val) {
				this.configData.carIds = [];
				if(val) {
					for(let index of val) {
						this.configData.carIds.push(index.carId);
					}
				}
			},
			
			//清空组织树选中状态
			deptClear(param) {
				this.$refs[param].setCurrentKey();
				this.snapJobCarList.deptId = "";
			},
			
			setConfig() {
				let vm = this;
				let msg = "";
				if(this.changeBtnName == "确定分配") {
					msg = "分配成功";
				} else if(this.changeBtnName == "取消分配") {
					msg = "取消分配成功";
				}
				//车辆为空  不可分配
				if(this.configData.carIds.length == 0) {
					Message.warning({
						message: "请选择车辆"
					});
					return;
				}
				let param = JSON.parse(JSON.stringify(vm.configData));
				vm.$instance.post("/proxy/bizmgr/snapJob/snapJobConfig", param).then(res => {
					if(res.status == 200){
						if (res.data.success) {
							vm.closeDialog(); //关闭 并清空 刷新
							Message({
								showClose: true,
								message: msg,
								type: 'success',
								duration: 1000
							});
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {});
			},
			
			//关闭 并清空 弹框
		    closeDialog(){
		    	this.configFormVisible = false;
		    	this.configData.type = '1';
		        this.snapJobCarList.config = '-1';
		        this.snapJobCarList.carNum = '';
		        this.changeBtnName = "确定分配";
		        this.isMakedConfig = false;
		        this.configData.carIds = [];
		        if(this.$refs.queryDept) {
					this.$refs.queryDept.deptClear();
				}
		    },
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	@import "src/assets/css/mixin.scss";
	
</style>
