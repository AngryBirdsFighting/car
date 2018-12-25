/** * @Author: qiaozp
 * * @DateTime: 2018-03-28 
 * @Description: 行程报表统计组件
*/
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="选择车辆">
					<el-input ref="car" v-model="carNum" placeholder="请点击获取车辆" @click.native = "getCarId" readonly class="selectCarTree-input"></el-input>
					<i class="el-icon-error closeI" @click="clearCar"></i>
					<depart-tree :departData = "departData" @closeDialog = "closeDepart($event)" @getCarIds="getCar($event)" @clearCars="clearCar($event)"></depart-tree>
				</el-form-item>
				<el-form-item label="媒体类型">
					<el-select v-model="listQuery.mediaType" clearable placeholder="请选择媒体类型">
						<el-option label="请选择" value=""></el-option>
						<el-option
							v-for="item in dictionaries.media_type"
							:key="item.dictCode"
							:label="item.dictName"
							:value="item.dictCode">
						</el-option>
					</el-select>					 
				</el-form-item>
				<el-form-item label="事件类型">
					<el-select v-model="listQuery.eventCode" clearable placeholder="请选择事件类型">
						<el-option label="请选择" value=""></el-option>
						<el-option
							v-for="item in dictionaries.media_event"
							:key="item.dictCode"
							:label="item.dictName"
							:value="item.dictCode">
						</el-option>
					</el-select>					 
				</el-form-item>
				<el-form-item label="拍摄日期">
					<el-date-picker 
						ref="inputDate"
						v-model="dataTime"
						type="date" 
						placeholder="选择日期"
						:picker-options="endDateOpt"
						id = "date1"
						value-format="yyyy-MM-dd">
					</el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='车牌号' prop="carNum"></el-table-column>
			<el-table-column align="center" label="媒体类型">
				<template slot-scope="scope">
					<div v-if="scope.row.mediaType == 0">
						图像
					</div>
					<div v-if="scope.row.mediaType == 1">
						音频
					</div>
					<div v-if="scope.row.mediaType == 2">
						视频
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="事件类型" prop="eventCode">
				<template slot-scope="scope">
					<div v-if="scope.row.eventCode == 0">
						平台下发指令
					</div>
					<div v-if="scope.row.eventCode == 1">
						定时动作
					</div>
					<div v-if="scope.row.eventCode == 2">
						抢劫报警触发
					</div>
					<div v-if="scope.row.eventCode == 3">
						碰撞侧翻报警触发
					</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="拍摄通道" prop="channel">
				<template slot-scope="scope">
					通道-{{scope.row.channel}}
				</template>
			</el-table-column>
			<el-table-column align="center" label="	拍摄时间" prop="shotTime"></el-table-column>
			<el-table-column align="center" label="操作" width="150px">
				<template slot-scope="scope">
					<el-button v-if="scope.row.mediaType == 0" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<div v-else>
						暂无操作
					</div>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!--查看图片弹窗-->
		<el-dialog title="查看图像" :visible.sync="checkFormVisible" top="5%" lock-scroll class="boxres dialog_input" :close-on-click-modal="false" :close-on-press-escape="false">
			<div style="text-align: center;padding-bottom: 15px;">
				<img v-if="imagePath" :src="imagePath" @error="imgShowError" style="height: 576px;width: 100%">
			</div>
		</el-dialog>

	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';
	import DepartTree from '../../components/DepartTree'; //组织机构弹框
	import Pagination from '../../components/Pagination';

	export default {
		components: {
			'depart-tree': DepartTree,
			'pagination': Pagination
		},
		watch: {
	      	filterText(val) {
				this.showTreeNodeId = [];
	        	this.$refs.tree2.filter(val);
	      	}
	    },
		data() {
			return {
				//按钮的权限   true 显示  false 隐藏
				permBtn:{
					trip_export: false,
				},
				checkFormVisible: false,//查看弹框
				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
				},
				carId:"",//选择的车辆ID
				carNum:"",//选择的车辆编号
				filterText: '',
				treeData: [],
				//自定义树的属性
		        defaultProps: {
		            children: 'children',
		            label: 'deptName'
		        },
				
				list: null, //表格list
				listLoading: false,
				height: 540,
				total: 0,
				dataTime: new Date(),//选择日期
				//日期选择的限制   ---start---
		        endDateOpt: {
		        	disabledDate: (time) => {
		                return time.getTime() > new Date().getTime();
		            }
		        },
		    	//日期选择的限制  ---end---
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					carId: '',
					eventCode: '',
					mediaType: ''
				},
				//数据字典
                dictionaries:{},
                imagePath: '',
                getImageUrl: '/proxy/file/viewImage?imagePath=',//获取image地址  参数为图片地址',//获取image地址  参数为图片地址
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				this.height = height;
			});
			vm.getPerm();
			vm.getDictionaries();//获取数据字典数据
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//打开组织机构弹框
			getCarId(){
				this.departData.dialog = true;
				this.departData.currentKeys = [];
				if (this.listQuery.carId) {
					this.departData.currentKeys.push(this.listQuery.carId);
				}
			},
			//关闭组织机构弹框
			closeDepart(param){
				this.departData.dialog = false;
			},
			//确定选择车辆
			getCar(nodes){
				if(nodes.carId){
					this.listQuery.carId = nodes.carId;//选中的车ID
					this.carNum = nodes.name;//车牌号
					this.departData.dialog = false;
				}
			},
			//子节点取消
			clearCar(param){
				this.listQuery.carId = "";//选中的车ID
				this.carNum = "";
			},
			//获取组织机构树
		    initDepart(){
		        let params = {};
		        let vm = this;
		        vm.$instance.get(api.departData, {param: params}).then(res =>{
					vm.listLoading = false;
		          if(res.status == 200){
		              vm.treeData = res.data.data;
		              resolve();//异步操作成功
		          }else{
		              Message.error(res.data.errorMsg);
		          }
		        }).catch(error => { vm.listLoading = false; });
		    },
		    
		    //获取字典
			getDictionaries() {
				let arr = ["media_type","media_event"];
				utils.batchDictsByCode(arr, data => {
					this.dictionaries = data;
					for (const key in this.dictionaries) {
                        this.dictionaries[key].forEach(item =>{
                            item.dictCode = parseInt(item.dictCode.split("_")[2]);
                        })      
                     } 
				})
			},
			
			//获取列表数据
			getList() {
				var vm = this;
				if(vm.$refs.car.value == ''){
					this.$message({
			          	message: '请选择搜索车辆！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					return;
				}
				if(vm.$refs.inputDate.value == null){
					this.$message({
			          	message: '请选择搜索时间！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					return;
				}
				vm.listQuery.shotTime = utils.turnTime(vm.$refs.inputDate.value);
				vm.listLoading = true;
				let param = JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/report/multiMedia/findmultiMedias", param).then(res =>{
		        	vm.listLoading = false;
		          if(res.status == 200){
		                vm.list = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { vm.listLoading = false; });
			},
			
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},
			
			/*查看*/
			check(index, row){
				if (row.url == "") {
					this.$message({
			          	message: '暂无图片！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					return;
				} else{
					this.imagePath = this.getImageUrl + row.url;
					this.checkFormVisible = true;
				}
			},
			
			//图片显示错误
			imgShowError() {
			    this.imagePath = require("../../assets/img/img-error.png");
			},
		}
	}
</script>
