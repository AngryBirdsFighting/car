/**
 * @Author:      dousp
 * @DateTime:    2018-03-30
 * @Description:围栏设置
 */
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="围栏名称">
					<el-input v-model="listQuery.railName" placeholder="输入围栏名称" clearable></el-input>
				</el-form-item>
				<el-form-item label="围栏形状">
					<el-select v-model="listQuery.railShape" clearable placeholder="选择围栏形状">
						<el-option
							v-for="item in railShapeList"
							:value="item.dictCode"
							:label="item.dictName"
							:key="item.dictCode">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" @click.native.prevent="getList(true)" icon="el-icon-search">查询</el-button>
					<el-button v-if="permBtn.rail_add" class="filter-item btnColor" type="primary" @click.native.prevent="handleCreate" icon="el-icon-plus">新增</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='围栏名称' prop="railName" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="围栏形状">
				<template slot-scope="scope">
					<div v-if="scope.row.railShape == 'circle'">圆形</div>
					<div v-else-if="scope.row.railShape == 'rectangle'">矩形</div>
					<div v-else-if="scope.row.railShape == 'polygon'">多边形</div>
					<div v-else-if="scope.row.railShape == 'polyline'">线路</div>
					<div v-else>-</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button v-if="permBtn.rail_set" class="btn rules" size="small" @click="handleSet(scope.$index, scope.row)" title="分配规则"></el-button>
					<el-button v-if="permBtn.rail_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.rail_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.rail_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!-- 新增弹窗 -->
		<el-dialog title="新增围栏" :visible.sync="addDialogFormVisible" top="10%" width="800px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" :model="addEditParamsTemp" ref="addRailForm" :rules="rules" label-position="left" label-width="10px"
					v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-form-item label="围栏名称：" prop="railName" label-width="100px">
						<el-input v-model="addEditParamsTemp.railName" placeholder="请输入围栏名称" :maxlength="50"></el-input>
					</el-form-item>
					<el-form-item label="" prop="speedFlag">
						<el-checkbox v-model="addEditParamsShow.speedFlag" @change.native.prevent="changeSpeedFlag">区域限速</el-checkbox>
						<el-input :disabled="!addEditParamsShow.speedFlag" style="margin-left: 10px; width:80px; padding:0px" v-model="addEditParamsTemp.speedLimit"></el-input>&nbsp;&nbsp;公里/小时，超时持续时间&nbsp;&nbsp;
						<el-input :disabled="!addEditParamsShow.speedFlag" style="width:80px;padding:0px" v-model="addEditParamsTemp.speedDuration"></el-input>&nbsp;&nbsp;秒
					</el-form-item>
					<el-form-item label="">
						<el-checkbox v-model="addEditParamsShow.enterAlarmDriver">进区提醒</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.enterAlarmPlantform">进区上报</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.exitAlarmDriver">出区提醒</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.exitAlarmPlantform">出区上报</el-checkbox>
					</el-form-item>
					<el-form-item label="" prop="timerFlag">
						<el-checkbox :disabled="addEditParamsTemp.railShape=='polyline'" v-model="addEditParamsShow.timerFlag" class="fl" @change.native.prevent="changeTimeFlag">生效时间</el-checkbox>
						<custom-time :myDisabled="!addEditParamsShow.timerFlag" ref="addCustomTime"></custom-time>
					</el-form-item>
					<el-form-item label="">
						<span><strong>注：</strong><span style="color: #999;">{{timeRemake}}</span></span>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="围栏形状:" label-width="90px" prop="railShape">
						<el-select v-model="addEditParamsTemp.railShape" disabled placeholder="请绘制围栏">
							<el-option
								v-for="item in railShapeList"
								:value="item.dictCode"
								:label="item.dictName"
								:key="item.dictCode">
							</el-option>
						</el-select>
						<el-button class="filter-item btnColor" type="primary" @click.native="drawRail">绘制围栏</el-button>
					</el-form-item>
					<el-form-item label="围栏数据：" label-width="95px">
						<div class="railDataDiv">
							<div v-if="addEditParamsTemp.railShape == 'circle'">
								<div>
									<strong>圆心：</strong>
									<label style="margin-left:30px;">
										经度：<el-input style="margin-left: 10px；margin-right: 20px;" v-model="trailCenter.lng"></el-input>
										纬度：<el-input style="margin-left: 10px" v-model="trailCenter.lat"></el-input>
									</label>
								</div>
								<div style="margin-top: 5px">
									<strong>半径：</strong> <el-input style="margin-left: 30px" v-model="trailRadius"></el-input>
								</div>
							</div>
							<div v-else-if="addEditParamsTemp.railShape == ''"></div>
							<div v-else :key="index" v-for="(item, index) in trailArrayLat" style="padding: 3px 0;">
								<el-row>
									<el-col :span="6">
										<label>轨迹点{{index}}：</label>
									</el-col>
									<el-col :span="9">
										经度：<el-input v-model="trailArrayLng[index]"></el-input>
									</el-col>
									<el-col :span="9">
										纬度：<el-input v-model="trailArrayLat[index]"></el-input>
									</el-col>
								</el-row>
							</div>
						</div>
					</el-form-item>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addDialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleCreateSubmit('addRailForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 修改弹窗 -->
		<el-dialog title="修改" :visible.sync="updateFormVisible" top="10%" width="800px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" :model="addEditParamsTemp" ref="editRailForm" :rules="rules" label-position="left" label-width="20px"
					v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-form-item label="围栏名称" prop="railName"  label-width="110px">
						<el-input v-model="addEditParamsTemp.railName" placeholder="请输入围栏名称" :maxlength="50"></el-input>
					</el-form-item>
					<el-form-item label="" prop="speedFlag">
						<el-checkbox v-model="addEditParamsShow.speedFlag" @change.native.prevent="changeSpeedFlag">区域限速</el-checkbox>
						<el-input :disabled="!addEditParamsShow.speedFlag" style="margin-left: 30px; width:80px; padding:0px" v-model="addEditParamsTemp.speedLimit"></el-input>公里/小时，超时持续时间
						<el-input :disabled="!addEditParamsShow.speedFlag" style="width:80px;padding:0px" v-model="addEditParamsTemp.speedDuration"></el-input>秒
					</el-form-item>
					<el-form-item label="">
						<el-checkbox v-model="addEditParamsShow.enterAlarmDriver">进区提醒</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.enterAlarmPlantform">进区上报</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.exitAlarmDriver">出区提醒</el-checkbox>
						<el-checkbox v-model="addEditParamsShow.exitAlarmPlantform">出区上报</el-checkbox>
					</el-form-item>
					<el-form-item label="" prop="timerFlag">
						<el-checkbox :disabled="addEditParamsTemp.railShape=='polyline'" v-model="addEditParamsShow.timerFlag" class="fl" @change.native.prevent="changeTimeFlag">生效时间</el-checkbox>
						<custom-time :myDisabled="!addEditParamsShow.timerFlag" ref="editCustomTime"></custom-time>
					</el-form-item>
					<el-form-item label="">
						<span><strong>注：</strong><span style="color: #999;">{{timeRemake}}</span></span>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="围栏形状:" label-width="90px" prop="railShape">
						<el-select v-model="addEditParamsTemp.railShape" disabled placeholder="请绘制围栏">
							<el-option
								v-for="item in railShapeList"
								:value="item.dictCode"
								:label="item.dictName"
								:key="item.dictCode">
							</el-option>
						</el-select>
						<el-button class="filter-item btnColor" type="primary" @click.native="drawRail">绘制围栏</el-button>
					</el-form-item>
					<el-form-item label="围栏数据：" label-width="95px">
						<div class="railDataDiv">
							<div v-if="addEditParamsTemp.railShape == 'circle'">
								<div>
									<strong>圆心：</strong>
									<label style="margin-left:30px;">
										经度：<el-input style="margin-left: 10px；margin-right: 20px;" v-model="trailCenter.lng"></el-input>
										纬度：<el-input style="margin-left: 10px" v-model="trailCenter.lat"></el-input>
									</label>
								</div>
								<div style="margin-top: 5px">
									<strong>半径：</strong> <el-input style="margin-left: 30px" v-model="trailRadius"></el-input>
								</div>
							</div>
							<div v-else-if="addEditParamsTemp.railShape == ''"></div>
							<div v-else :key="index" v-for="(item, index) in trailArrayLat" style="padding: 3px 0;">
								<el-row>
									<el-col :span="6">
										<label>轨迹点{{index}}：</label>
									</el-col>
									<el-col :span="9">
										经度：<el-input v-model="trailArrayLng[index]"></el-input>
									</el-col>
									<el-col :span="9">
										纬度：<el-input v-model="trailArrayLat[index]"></el-input>
									</el-col>
								</el-row>
							</div>
						</div>
					</el-form-item>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editRailForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 查看弹窗 -->
		<el-dialog title="查看" :visible.sync="checkFormVisible" top="10%" width="600px" lock-scroll>
			<el-form class="small-space" :model="addEditParamsTemp" label-position="left" label-width="10px">
				<el-row>
					<el-form-item label="围栏名称：" label-width="90px">
						<strong>{{addEditParamsTemp.railName}}</strong>
					</el-form-item>
					<el-form-item label="" v-show="addEditParamsShow.speedFlag">
						<el-checkbox disabled v-model="addEditParamsShow.speedFlag">区域限速</el-checkbox>
						<label>
							<strong style="margin-left: 30px;">{{addEditParamsTemp.speedLimit}}</strong>公里/小时，超时持续时间
							<strong>{{addEditParamsTemp.speedDuration}}</strong>秒
						</label>
					</el-form-item>
					<el-form-item label="">
						<el-checkbox disabled v-model="addEditParamsShow.enterAlarmDriver">进区提醒</el-checkbox>
						<el-checkbox disabled v-model="addEditParamsShow.enterAlarmPlantform">进区上报</el-checkbox>
						<el-checkbox disabled v-model="addEditParamsShow.exitAlarmDriver">出区提醒</el-checkbox>
						<el-checkbox disabled v-model="addEditParamsShow.exitAlarmPlantform">出区上报</el-checkbox>
					</el-form-item>
					<el-form-item label="" v-show="addEditParamsShow.timerFlag">
						<el-checkbox disabled v-model="addEditParamsShow.timerFlag" class="fl">生效时间</el-checkbox>
						<div style="line-height: 30px;">
							<strong style="margin-left: 30px;">{{addEditParamsTemp.startTime}}</strong>  
							至  
							<strong>{{addEditParamsTemp.endTime}}</strong>
						</div>
					</el-form-item>
					<div class="splitter-line"></div>
					<el-form-item label="围栏形状：" label-width="90px">
						<strong v-if="addEditParamsTemp.railShape == 'circle'">圆形</strong>
						<strong v-else-if="addEditParamsTemp.railShape == 'rectangle'">矩形</strong>
						<strong v-else-if="addEditParamsTemp.railShape == 'polygon'">多边形</strong>
						<strong v-else-if="addEditParamsTemp.railShape == 'polyline'">线路</strong>
						<el-button style="margin-left:30px;" class="filter-item btnColor" type="primary" @click.native="checkDrawRail">查看围栏</el-button>
					</el-form-item>
					<el-form-item label="围栏数据：" label-width="90px">
						<div class="railDataDiv">
							<div v-if="addEditParamsTemp.railShape == 'circle'">
								<div>
									<strong>圆心：</strong>
									<label style="margin-left:20px;">
										经度：<strong style="margin-right:30px;">{{trailCenter.lng}}</strong>
										纬度：<strong>{{trailCenter.lat}}</strong>
									</label>
								</div>
								<div style="margin-top: 5px">
									<strong>半径：</strong> <strong style="margin-left:20px;">{{trailRadius}}</strong> 
								</div>
							</div>
							<div v-else-if="addEditParamsTemp.railShape == ''"></div>
							<div v-else :key="index" v-for="(item, index) in trailArrayLat" style="padding: 3px 0;">
								<el-row>
									<el-col :span="6">
										<label>轨迹点{{index}}:</label>
									</el-col>
									<el-col :span="9">
										经度：<strong>{{trailArrayLng[index]}}</strong>
									</el-col>
									<el-col :span="9">
										纬度：<strong>{{trailArrayLat[index]}}</strong>
									</el-col>
								</el-row>
							</div>
						</div>
					</el-form-item>
				</el-row>
			</el-form>				
		</el-dialog>

		<!-- 绘制围栏地图 -->
		<el-dialog class="map-dialog" :title="checkFormVisible?'查看围栏':'绘制围栏'" :visible.sync="mapFormVisible" top="0px" width="100%" lock-scroll>
			<div>
				<div id="allmapRail" class="mapRail"></div> 
			</div>	
			<div v-show="!checkFormVisible" slot="footer" class="dialog-footer" style="margin-top: 10px;">
				<el-button @click="mapFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="drawRailOk" class="btnColor">确 定</el-button>
			</div>			
		</el-dialog>

		<!-- 规则设置 查询规则车辆 -->
		<rule-set-dialog ref="ruleSetChild" :rulesData="rulesData"  @changeRule="changeRules($event)"></rule-set-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import CustomTime from '../../components/CustomTime'; //自定义时间
	import RuleSetDialog from '../../components/RuleSetDialog';//分配规则组件
	import Pagination from '../../components/Pagination';

	export default {
		components: {
			'custom-time': CustomTime,
			'rule-set-dialog':RuleSetDialog,//分配规则组件
			'pagination': Pagination
		},
		data() {
			const vm = this;
			//速度校验
			const validateSpeed = (rule, value, callback) => {
				if (vm.addEditParamsShow.speedFlag == false) {
					callback();
				} else {
					const reg = /^[0-9]+$/;
					if (vm.addEditParamsTemp.speedLimit == "") {
						callback(new Error('最高速度不能为空'));
						return;
					} else {
						let falg = reg.test(vm.addEditParamsTemp.speedLimit);
						if(!falg){
							callback(new Error('最高速度必须为正整数'));
							return;
						}
					}
					if (vm.addEditParamsTemp.speedDuration == "") {
						callback(new Error('超速持续时间不能为空'));
						return;
					} else {
						let falg2= reg.test(vm.addEditParamsTemp.speedDuration);
						if(!falg2){
							callback(new Error('持续时间必须为正整数'));
							return;
						}
					}
					callback();
				}
			};
			//时间校验
			const validateTime = (rule, value, callback) => {
				if (vm.addEditParamsShow.timerFlag == false) {
					callback();
				} else {
					var ref = null;
					//编辑新增
					if (vm.addDialogFormVisible) {
						ref = vm.$refs.addCustomTime;
					} else {
						ref = vm.$refs.editCustomTime
					}
					if (ref.yearTime1 == "" || ref.dayTime1 == "" || ref.dayTime1 == null) {
						callback(new Error('开始日期和时间不能为空'));
					} else if (ref.yearTime2 == "" || ref.dayTime2 == "" || ref.dayTime2 == null) {
						callback(new Error('结束日期和时间不能为空'));
					} else {
						callback();
					}
				}
			};

			return {
				//按钮的权限
				permBtn:{
					rail_add: false, 
					rail_delete: false, 
					rail_modify: false, 
					rail_check: false,
					rail_set: false
				},

				//分配规则数据
	     		rulesData:{
	     			railId: '',//规则ID
	     			name: '',//规则名称
					dialog: false,//弹框是否显示
					type: 2//1：规则设定 分配规则  2：围栏设置 分配规则
	     		},
				
				list: null,//表格list
				total: 0,
				listLoading: false,
				height: 540,

				mapDialogHeight: 200,
				map: null,
				drawingManager: null,

				//绘制工具
				styleOptions: {
					strokeColor: "red", //边线颜色。
					fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
					strokeWeight: 3, //边线的宽度，以像素为单位。
					strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
					fillOpacity: 0.1, //填充的透明度，取值范围0 - 1。
					strokeStyle: 'solid' //边线的样式，solid或dashed。
				},

				//查询列表
				listQuery: {
					iDisplayStart: 0,
					iDisplayLength: 10,
					railName: "",
					railShape: "" //circle ：圆形 rectangle：矩形 polygon：多边形 polyline：线路
				},
				
				//围栏选择数据
				railShapeList: [
					{dictCode: "circle", dictName: "圆形"},
					{dictCode: "rectangle", dictName: "矩形"},
					{dictCode: "polygon", dictName: "多边形"},
					{dictCode: "polyline", dictName: "线路"}
				],

				//新增参数
				addEditParamsTemp: {
					railId: "", //围栏Id   新增将此key删除

					enterAlarmDriver: '', //驶入报警驾驶员  1：打开 0：关闭
					enterAlarmPlantform: '',//驶入报警平台  1：打开 0：关闭
					exitAlarmDriver: "", //驶出报警驾驶员  1：打开 0：关闭
					exitAlarmPlantform: "", //驶出报警平台  1：打开 0：关闭
					railName: "", //围栏名称
					railShape: "", //围栏形状
					railVal: {}, //围栏值
					speedDuration: "",  //超速持续时间
					speedFlag: "",  //区域限速开关
					speedLimit: "", //最高速度
					startTime: "", //开始时间
					timerFlag: "", // 区域时间开关  1：打开 0：关闭 
					endTime: '', //结束时间
				},

				timeRemake: "生效时间区间，在开始日期和结束日期中，如果年月日设置为00，表示不限制年月日。\
							开始日期和结束日期格式，必须遵循同时限制年或者月或者日，即：(00-00-**)与(00-00-**)或者（**-00-00）与（**-00-00）等。",

				//新增编辑  辅助显示的变量
				addEditParamsShow: {
					speedFlag: false,
					enterAlarmDriver: false,
					enterAlarmPlantform: false,
					exitAlarmDriver: false,
					exitAlarmPlantform: false,
					timerFlag: false,
				},
				trailArrayLat: {},  //纬度
				trailArrayLng: {}, //经度
				trailCenter: {},   
				trailRadius: "",
				dataType: "bd09", //给后台说明围栏数据是什么坐标

				mapDrawData: {
					railShape: "",
					arrayPath: [],
					centerLng: "",
					centerLat: "",
					radius: ""
				},
				overlays: [],
				centerPos: null,

				//表单验证规则
				rules: {
					railName: [
						{ required: true, message: '请输入角色描述', trigger: 'blur' }
					],
					speedFlag: [
						{ required: true,  validator: validateSpeed, trigger: 'blur' }
					],
					timerFlag: [
						{ required: true,  validator: validateTime, trigger: 'change' }
					],
					railShape: [
						{ required: true, message: '请绘制围栏', trigger: 'change' }
					]
				},

				addDialogFormVisible: false,
				checkFormVisible: false,
				updateFormVisible: false,
				mapFormVisible: false,
				fatigueType: false,
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				vm.height = height;
				vm.mapDialogHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 115;//浏览器高度
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
				let param = JSON.parse(JSON.stringify(vm.listQuery));
				vm.$instance.post("/proxy/bizmgr/rail/findRuleList", param).then(res =>{
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
			//延时触发加载地图
			timeOutLoadMap(type = 'addEdit') {
				var vm = this;
				this.mapDrawData.centerLng = "";
				this.mapDrawData.centerLat = "";
				this.mapDrawData.radius = "";
				this.mapDrawData.arrayPath = [];
				let t1 = window.setTimeout(()=>{
					vm.initMap();
					window.clearTimeout(t1); //去掉定时器 
				}, 100);
			},
			initMap() {
				var vm = this;
				// 百度地图API功能
				vm.map = new BMap.Map("allmapRail");    // 创建Map实例
				vm.map.addEventListener("tilesloaded", this.mapLoaded);
				vm.map.centerAndZoom("西安", 12);  // 初始化地图,设置中心点坐标和地图级别
				vm.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
				//查看没有按钮
				if (vm.checkFormVisible) {
					document.getElementById("allmapRail").style.height = (vm.mapDialogHeight + 40) + 'px';	
				} else {
					document.getElementById("allmapRail").style.height = vm.mapDialogHeight + 'px';	
				}
			},
			mapLoaded() {
				var vm = this;
				this.map.removeEventListener("tilesloaded", this.mapLoaded);
				if (vm.checkFormVisible) {
					// debugger;
				} else {
					//实例化鼠标绘制工具
					vm.drawingManager = new BMapLib.DrawingManager(vm.map, {
						isOpen: false, //是否开启绘制模式
						enableDrawingTool: true, //是否显示工具栏
						drawingToolOptions: {
							anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
							offset: new BMap.Size(5, 5), //偏离值
						},
						circleOptions: vm.styleOptions, //圆的样式
						polylineOptions: vm.styleOptions, //线的样式
						polygonOptions: vm.styleOptions, //多边形的样式
						rectangleOptions: vm.styleOptions //矩形的样式
					});
					//添加鼠标绘制工具监听事件，用于获取绘制结果
					vm.drawingManager.addEventListener('overlaycomplete', vm.overlaycomplete);
				}
				this.loadMapOverLay();
			},
			//编辑将当期浮层加载上去
			loadMapOverLay() {
				var vm = this;
				var overLay = null;
				this.mapDrawData.railShape = this.addEditParamsTemp.railShape;
				if (this.addEditParamsTemp.railShape == "circle") {
					this.mapDrawData.centerLng = this.trailCenter.lng;
					this.mapDrawData.centerLat = this.trailCenter.lat;
					this.mapDrawData.radius = this.trailRadius;
					
					var point = new BMap.Point(this.mapDrawData.centerLng, this.mapDrawData.centerLat);
					overLay = new BMap.Circle(point, this.mapDrawData.radius, this.styleOptions); //创建圆
				} else if (this.addEditParamsTemp.railShape == "rectangle") {
					var points = this.getBMapPointsFromArray(this.trailArrayLng, this.trailArrayLat);
					this.mapDrawData.arrayPath = points;
					overLay = new BMap.Polygon(points, this.styleOptions); 
				} else if (this.addEditParamsTemp.railShape == "polygon") {
					var points = this.getBMapPointsFromArray(this.trailArrayLng, this.trailArrayLat);
					this.mapDrawData.arrayPath = points;
					overLay = new BMap.Polygon(points, this.styleOptions); 
				} else if (this.addEditParamsTemp.railShape == "polyline") {
					var points = this.getBMapPointsFromArray(this.trailArrayLng, this.trailArrayLat);
					this.mapDrawData.arrayPath = points;
					overLay = new BMap.Polyline(points, this.styleOptions); 
				} else {
					
				}
				if (overLay) {
					this.map.addOverlay(overLay);
					this.overlays.push(overLay);
					let t1 = window.setTimeout(()=>{
						if (vm.mapDrawData.arrayPath.length != 0) {
							//多边形直接设置所有点都在视图内
							vm.map.setViewport(this.mapDrawData.arrayPath);
						} else {
							//圆形只能根据半径去设置地图放大比例
							if (overLay.getRadius() < 100) {
								vm.map.setZoom(22);
							} else if (overLay.getRadius() < 300) {
								vm.map.setZoom(20);
							} else if (overLay.getRadius() < 500) {
								vm.map.setZoom(18);
							} else if (overLay.getRadius() < 1000) {
								vm.map.setZoom(16);
							} else if (overLay.getRadius() < 10000){
								vm.map.setZoom(14);
							} else if (overLay.getRadius() < 20000){
								vm.map.setZoom(12);
							} else {
								vm.map.setZoom(10);
							}
							vm.map.panTo(overLay.getCenter());
						}
					}, 500);
				}
				
			},
			//把数组转化为坐标数组  返回值为地图坐标数组
			getBMapPointsFromArray(arrayLng, arrayLat) {
				var points = [];
				for (var i = 0; i < arrayLng.length; i++) {
					var point = new BMap.Point(arrayLng[i], arrayLat[i]);
					points.push(point);
				}
				return points;
			},
			//把坐标数组转化为数组  参数1：地图坐标数组
			getArrayFromBMapPoints(mapPoints) {
				this.trailArrayLat = [];
				this.trailArrayLng = [];
				for (var i = 0; i < mapPoints.length; ++i) {
					this.trailArrayLat.push(mapPoints[i].lat);
					this.trailArrayLng.push(mapPoints[i].lng);
				}
			},
			//把数组转化为对象数组 ，经纬度*1000000 
			getPointsFromArray(arrayLng, arrayLat) {
				var points = [];
				for (var i = 0; i < arrayLng.length; i++) {
					var point = {lng: arrayLng[i], lat: arrayLat[i]};
					points.push(point);
				}
				return points;
			},
			//把坐标数组转化为数组 经纬度/1000000  参数1：地图坐标数组
			getArrayFromPoints(mapPoints) {
				// debugger;
				this.trailArrayLat = [];
				this.trailArrayLng = [];
				for (var i = 0; i < mapPoints.length; ++i) {
					this.trailArrayLat.push(mapPoints[i].lat);
					this.trailArrayLng.push(mapPoints[i].lng);
				}
			},
			//绘制围栏
			drawRail() {
				this.fatigueType = false;
				this.mapFormVisible = true;
				this.timeOutLoadMap();
			},
			//地图查看围栏
			checkDrawRail() {
				this.mapFormVisible = true;
				this.timeOutLoadMap('check');
			},
			//绘制完成
			overlaycomplete(e) {
				//circle 圆 ,polyline线路 ,polygon多边形,rectangle矩形
				this.mapDrawData.railVal = {};
				//点绘制没有作用
				if(e.drawingMode == "marker") {
					this.map.removeOverlay(e.overlay);
					return;
				}
				if (this.updateFormVisible) { //编辑不能修改围栏形状
					if (this.mapDrawData.railShape != e.drawingMode) {
						this.map.removeOverlay(e.overlay);
						Message.error({message: "编辑围栏，围栏的形状不能修改!"});
						return;
					}
				}
				this.mapDrawData.railShape = e.drawingMode;

				if(this.mapDrawData.railShape == "circle") { //圆
					this.mapDrawData.radius = parseInt(e.overlay.getRadius());
					this.mapDrawData.centerLat = e.overlay.getCenter().lat;   //lat  lng
					this.mapDrawData.centerLng = e.overlay.getCenter().lng;   //lat  lng
				} else {
					this.mapDrawData.arrayPath = e.overlay.getPath();
				}
				//删除原来的
				this.clearAll();
				this.overlays.push(e.overlay);
			},
			//绘制完下一个，将上一个删除
			clearAll() {
				for(var i = 0; i < this.overlays.length; i++) {
					this.map.removeOverlay(this.overlays[i]);
				}
				this.overlays = [];
			},
			//绘制确定
			drawRailOk() {
				this.trailArrayLat = [];
				this.trailArrayLng = [];

				this.addEditParamsTemp.railShape = this.mapDrawData.railShape;
				this.addEditParamsTemp.railVal = {};
				if (this.mapDrawData.railShape == "circle") {
					this.trailRadius = this.mapDrawData.radius;
					this.trailCenter = {lng:this.mapDrawData.centerLng, lat:this.mapDrawData.centerLat};
				} else {
					this.getArrayFromBMapPoints(this.mapDrawData.arrayPath);
					//线型没有时间
					if (this.addEditParamsTemp.railShape == "polyline") {
						if (this.addEditParamsShow.timerFlag) {
							this.addEditParamsShow.timerFlag = false;
							Message.warning({message: "线型围栏不支持生效时间！"});
							this.changeTimeFlag();
						}

					}
				}
				this.mapFormVisible = false;
				//只需要校验新增，修改围栏不可能为空
				if (this.addDialogFormVisible) {
					this.$refs.addRailForm.validateField("railShape");
				}
				this.fatigueType = true;
			},
			//新增编辑提交前，获取参数
			getCommitParam() {
				
				this.addEditParamsTemp.enterAlarmDriver = this.addEditParamsShow.enterAlarmDriver ? "1" : "0";
				this.addEditParamsTemp.enterAlarmPlantform = this.addEditParamsShow.enterAlarmPlantform ? "1" : "0";
				this.addEditParamsTemp.exitAlarmDriver = this.addEditParamsShow.exitAlarmDriver ? "1" : "0";
				this.addEditParamsTemp.exitAlarmPlantform = this.addEditParamsShow.exitAlarmPlantform ? "1" : "0";
				this.addEditParamsTemp.timerFlag = this.addEditParamsShow.timerFlag ? "1" : "0";
				this.addEditParamsTemp.speedFlag = this.addEditParamsShow.speedFlag ? "1" : "0";

				if (this.addEditParamsShow.timerFlag) {
					var ref = null;
					//编辑新增
					if (this.addDialogFormVisible) {
						ref = this.$refs.addCustomTime;
					} else {
						ref = this.$refs.editCustomTime
					}

					this.addEditParamsTemp.startTime = ref.yearTime1 + " " +  ref.dayTime1;
					this.addEditParamsTemp.endTime = ref.yearTime2 + " " +  ref.dayTime2;

					var start = this.addEditParamsTemp.startTime;
					var end = this.addEditParamsTemp.endTime;

					var startData = ref.yearTime1;
					var endDate = ref.yearTime2;

					var list = startData.split("-");
					var list1 = endDate.split("-");
					var isError = false;
					if (list[0] == "00" && list1[0] !="00" || list1[0] == "00" && list[0] !="00") {
						isError = true;
					} else if (list[1] == "00" && list1[1] != "00" || list1[1] == "00" && list[1] !="00") {
						isError = true;
					} else if (list[2] == "00" && list1[2] != "00" || list1[2] == "00" && list[2] !="00") {
						isError = true;
					} else if (start >= end) {
						Message.error({message:"生效时间区间错误，开始时间大于或者等于结束时间！"});
						return false;
					}
					if (isError) {
						Message.error({message:"生效时间区间错误，开始和结束日期格式，必须遵循同时限制年或者月或者日！"});
						return false;
					}
				}

				if (this.addEditParamsTemp.railShape == "circle") {
					//前端直接将百度坐标传到后台，由后台下发的时候转
					this.addEditParamsTemp.railVal.centerLat = this.trailCenter.lat;   //lat  lng
					this.addEditParamsTemp.railVal.centerLng = this.trailCenter.lng;
					this.addEditParamsTemp.railVal.radius = this.trailRadius;
				} else {
					this.addEditParamsTemp.railVal = {};
					this.addEditParamsTemp.railVal.points = this.getPointsFromArray(this.trailArrayLng, this.trailArrayLat);
				}
				this.addEditParamsTemp.railVal.type = this.dataType; //数据来源于百度
				return true;
			},
			//编辑
			handleEdit(index, row) {
				this.addEditParamsTemp.railId = row.railId;
				this.resetForm("editRuleForm");
				this.getRailInfo("edit", row.railId);
				this.updateFormVisible = true;
			},
			//根据railId获取数据
			getRailInfo(type, railId) {
				let vm = this;
				let param = {};
				param.railId = railId;
				//调用接口
				vm.$instance.get("/proxy/bizmgr/rail/findRailInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.addEditParamsShow.enterAlarmDriver = res.data.enterAlarmDriver == "1" ? true : false;
						vm.addEditParamsShow.enterAlarmPlantform = res.data.enterAlarmPlantform == "1" ? true : false;
						vm.addEditParamsShow.exitAlarmDriver = res.data.exitAlarmDriver == "1" ? true : false;
						vm.addEditParamsShow.exitAlarmPlantform = res.data.exitAlarmPlantform == "1" ? true : false;

						vm.addEditParamsTemp.railName = res.data.railName;
						vm.addEditParamsTemp.railShape = res.data.railShape;

						vm.addEditParamsTemp.railVal = JSON.parse(res.data.railVal);
						//处理点集合数据，由于要支持编辑，数组没法绑定到视图上，对象可以绑定 所以讲数组转化为对象
						if (vm.addEditParamsTemp.railShape == "circle") {
							vm.trailCenter = {lng: vm.addEditParamsTemp.railVal.centerLng, lat: vm.addEditParamsTemp.railVal.centerLat};
							vm.trailRadius = vm.addEditParamsTemp.railVal.radius;
						} else {
							vm.getArrayFromPoints(vm.addEditParamsTemp.railVal.points);
						}

						vm.addEditParamsShow.speedFlag = res.data.speedFlag == "1" ? true : false;
						vm.addEditParamsTemp.speedDuration = res.data.speedDuration;
						vm.addEditParamsTemp.speedLimit = res.data.speedLimit;

						vm.addEditParamsShow.timerFlag = res.data.timerFlag  == "1" ? true : false;
						vm.addEditParamsTemp.startTime = res.data.startTime;
						vm.addEditParamsTemp.endTime = res.data.endTime;						

						if (type == "edit") {//编辑
							//设置时间值 等控件创建完再去设置，否则奔溃
							if (vm.$refs.editCustomTime) {
								vm.editSetTimeData();
							} else {
								let t2 = window.setInterval(()=>{
									if (vm.$refs.editCustomTime) {
										window.clearInterval(t2);
										vm.editSetTimeData();
									}
								}, 50);
							}
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {vm.checkFormVisible = false; vm.updateFormVisible = false; Message.error({message:"数据获取失败！"});});
			},
			//编辑回填时间控件数据
			editSetTimeData() {
				var vm = this;
				if (vm.addEditParamsShow.timerFlag && vm.addEditParamsTemp.startTime && vm.addEditParamsTemp.startTime != ""
						&& vm.addEditParamsTemp.endTime && vm.addEditParamsTemp.endTime != "") {
					var strList = vm.addEditParamsTemp.startTime.split(" ");
					vm.$refs.editCustomTime.yearTime1 = strList[0];
					vm.$refs.editCustomTime.dayTime1 = strList[1];
					strList = vm.addEditParamsTemp.endTime.split(" ");
					vm.$refs.editCustomTime.yearTime2 = strList[0];
					vm.$refs.editCustomTime.dayTime2 = strList[1];
				} else {
					vm.$refs.editCustomTime.yearTime1 = "";
					vm.$refs.editCustomTime.dayTime1 = "";
					vm.$refs.editCustomTime.yearTime2 = "";
					vm.$refs.editCustomTime.dayTime2 = "";
				}
			},
			//编辑提交前数据校验
			handleEditSubmit(formName) {
				var vm = this;

				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						if (vm.getCommitParam()) {
							vm.editSubmit();
						}
						
					}
				});
			},
			//编辑提交
			editSubmit() {
				var vm = this;
				vm.updateLoad = true;
				let param = JSON.parse(JSON.stringify(vm.addEditParamsTemp));
				delete param.railShape;
				param.railVal = JSON.stringify(param.railVal);
				vm.$instance.post("/proxy/bizmgr/rail/modifyRail", param).then(res =>{
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
				});
			},
			//单个删除
			handleDelete(index, row) {
				var vm = this;
				let param = {};
				param.railId = row.railId;
				//确定删除
				this.$confirm('是否删除< '+ row.railName +' >围栏！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/bizmgr/rail/deleteRule", param).then(res =>{
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
				this.addEditParamsTemp.railName = ""; //围栏名称

				this.addEditParamsTemp.speedDuration = "";  //超速持续时间
				this.addEditParamsTemp.speedLimit = ""; //最高速度
				this.addEditParamsTemp.startTime = ""; //开始时间
				this.addEditParamsTemp.endTime = ''; //结束时间
				this.addEditParamsTemp.railShape = '';
				
				this.addEditParamsShow.speedFlag = false;
				this.addEditParamsShow.enterAlarmDriver = false;
				this.addEditParamsShow.enterAlarmPlantform = false;
				this.addEditParamsShow.exitAlarmDriver = false;
				this.addEditParamsShow.exitAlarmPlantform = false;
				this.addEditParamsShow.timerFlag = false;

				this.resetForm('addRailForm');
				if (this.$refs.perTreeAdd) {
					this.$refs.perTreeAdd.setCheckedKeys([]);
				}
				this.addDialogFormVisible = true;
				var vm = this;

				//设置时间值 等控件创建完再去设置，否则奔溃
				if (vm.$refs.addCustomTime) {
					vm.$refs.addCustomTime.yearTime1 = "";
					vm.$refs.addCustomTime.dayTime1 = "";
					vm.$refs.addCustomTime.yearTime2 = "";
					vm.$refs.addCustomTime.dayTime2 = "";
				} else {
					let t3 = window.setInterval(()=>{
						// console.log("ok");
						if (vm.$refs.addCustomTime) {
							window.clearInterval(t3);
							vm.$refs.addCustomTime.yearTime1 = "";
							vm.$refs.addCustomTime.dayTime1 = "";
							vm.$refs.addCustomTime.yearTime2 = "";
							vm.$refs.addCustomTime.dayTime2 = "";
						}
					}, 10);
				}
			},
			//新增提交前form数据校验
			handleCreateSubmit(formName) {
				var vm = this;

				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						if (vm.getCommitParam()){
							vm.createSubmit();
						}
					}
				});
			},
			//新增提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				let param = JSON.parse(JSON.stringify(vm.addEditParamsTemp));
				delete param.railId;
				param.railVal = JSON.stringify(param.railVal);
				vm.$instance.post("/proxy/bizmgr/rail/addRail", param).then(res =>{
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
				}).catch(error => {
					vm.addLoad = false;
					Message.error({message:"添加失败！"});
				});
			},
			//查看
			check(index, row){	
				this.getRailInfo("check", row.railId);
				this.checkFormVisible = true;
			},
			//分配规则
			handleSet(index, row) {
				this.rulesData.name = row.railName;//规则名称
				this.rulesData.railId = row.railId;//规则ID
				this.rulesData.dialog = true;//弹框显示
			},
			//关闭规则设置
		    changeRules(param){
		    	this.rulesData.dialog = param;
		    },
			changeSpeedFlag(){
				if (this.addEditParamsShow.speedFlag) {
					return;
				}
				if (this.addDialogFormVisible == true){
					this.$refs.addRailForm.validateField('speedFlag');//单独校验
				}else {
					this.$refs.editRailForm.validateField('speedFlag');//单独校验
				}
			},
			changeTimeFlag(){
				if (this.addEditParamsShow.timerFlag) {
					return;
				}
				if (this.addDialogFormVisible == true){
					this.$refs.addRailForm.validateField('timerFlag');//单独校验
				}else {
					this.$refs.editRailForm.validateField('timerFlag');//单独校验
				}
			},
			//重置表单
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
			}
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	.railDataDiv{
		padding: 5px 5px;
		max-height: 200px;
		min-height: 40px;
		border: 1px solid #666;
		overflow-y: auto;
	}
	.splitter-line {
		height:1px;
		background:#ddd;
		margin-bottom:10px;
	}
	.map-dialog{
		.el-dialog__body{
			padding: 0px;
		}
		
	}
	.mapRail{
		width: 100%;
		height: 200px;
		border: 1px solid gray;
		overflow:hidden;
	}
	.drawRail{
		margin: 0 40px;
	}
</style>

