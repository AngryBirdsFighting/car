/** * @Author: qinbb
 * * @DateTime: 2018-02-27 
 * @Description: 车辆定位组件
*/
<template>
	<div class="app-container home-con">
		<div class="fl tree-box" ref="treeBox" v-bind:style="{height: heightData}">
			<ul class="tree-title">
				<li class="fl">车队列表</li>
				<li class="fr imgs-type">
					<img src="../../assets/img/tree_tip.png" @mouseover="tipImgsToggle" @mouseleave="tipImgsToggle" />
					<div class="type_box" v-if="imgsTypeVisible">
						<ul>
							<li><img src="../../assets/img/car-online.png" />在线</li>
							<li><img src="../../assets/img/car-out.png" />离线</li>
							<li><img src="../../assets/img/car-stop.png" />怠速</li>
							<li><img src="../../assets/img/car-tip.png" />报警</li>
							<li><img src="../../assets/img/car-noactive.png" />未激活</li>
						</ul>
					</div>
				</li>
			</ul>
			<ul class="carTypeCount">
				<li @click="allCheck" :class="{'liActive': liClass == 1}">
					<p>全部</p>
					<p>({{allCarNum}})</p>
				</li>
				<li @click="onlineCheck" :class="{'liActive': liClass == 2}">
					<p>在线</p>
					<p>({{online}})</p>
				</li>
				<li @click="offlineCheck" :class="{'liActive': liClass == 3}">
					<p>离线</p>
					<p>({{offline}})</p>
				</li>
				<li @click="notActiveCheck" :class="{'liActive': liClass == 4}">
					<p>未激活</p>
					<p>({{notActive}})</p>
				</li>
			</ul>
			<el-input placeholder="搜索车辆..." class="select-tree-input" style="margin-top:10px" v-model="filterText"></el-input>
			<div class="tree-list" ref="elTree" v-bind:style="{height: treeHeight}">
				<el-tree 
				:props="defaultProps" 
				:data="treeData" 
				show-checkbox 
				node-key="id"
				:expand-on-click-node="false" 
				:default-checked-keys="carIds"
				:render-content="renderContent"
				:filter-node-method="filterNode"
				:default-expanded-keys="defaultOpenNodes"
				@check="handleNodeCheck"
				@node-contextmenu="showOrderMenu"
				@node-click="setMapZoom"
				@node-expand="nodeExpand"
				@node-collapse="nodeCollapse"
				ref="tree2"
				v-loading="treeLoad"
				element-loading-text="拼命加载中">
				</el-tree>
			</div>
			<div class="gpsInterval1">每隔{{mapForm.gpsInterval}}秒自动更新</div>
		</div>
		<div class="fr map-box" v-bind:style="{height: heightData}">
			<div id="carGps" class="mapTrail" v-bind:style="{height: mapHeight}"></div>
			<div class="table-box1">
				<ul>
					<li class="fl">
						<el-button  @click.native.prevent = "changeTable('gps')" :class="{'tab-active': tabActiveFlag}" class="tabButton">GPS信息</el-button>
						<el-button  @click.native.prevent = "changeTable('order')" :class="{'tab-active': !tabActiveFlag}" class="tabButton">指令信息</el-button>
						<el-button  v-show="!tabActiveFlag" @click.native.prevent = "refreshGps" type="primary" style="margin-top:5px">查询</el-button>
					</li>
					<li class="fr">
						<el-button class="tabBtn tabBig" v-show="tableFlag" @click.native.prevent="changeIcon('up')"  title="展开"></el-button>
						<el-button class="tabBtn tabSmall" v-show="!tableFlag" @click.native.prevent="changeIcon('down')" title="收回"></el-button>
					</li>
				</ul>
				<div v-if="tabActiveFlag && !tableFlag" v-bind:style="{height: mapHeight}"> 
					<el-table key="multipleTable" ref="multipleTable" :data="GPSdata" height="155" style="width: 100%"
						v-loading="tableLoadGps" element-loading-text="拼命加载中">
					    <el-table-column align="center" prop="carNum" label='车牌号'></el-table-column>
					    <el-table-column align="center" prop="gpsTime" label="定位时间"></el-table-column>
					    <el-table-column align="center" prop="speed" label="速度(Km/h)"></el-table-column>
					    <el-table-column align="center" prop="direation" label="方向"></el-table-column>
					    <el-table-column align="center" prop="online" label="车辆状态"></el-table-column>
					    <el-table-column align="center" prop="lbsFlag" label="定位状态"></el-table-column>
					    <el-table-column align="center" prop="acc" label="acc状态"></el-table-column>
					    <el-table-column align="center" prop="address" label="位置">
					    	<!-- <template slot-scope="scope">
					    		<div v-html="setPosition(scope.row.address,scope.row.longitude, scope.row.latitude)">
					    											
					    		</div>
					    									</template>  -->
					    </el-table-column>
					    <el-table-column align="center" prop="mileage" label="里程(km)"></el-table-column>
					    <el-table-column align="center" label="报警">
					    	<template slot-scope="scope">
					    		<div v-html="convertAlarmType(scope.row.alarm)"></div>
							</template>
					    </el-table-column>
					    <!-- <el-table-column align="center" prop="simSignal" label="信号"></el-table-column> -->
					    <el-table-column align="center" prop="description" label="其他"></el-table-column>
				  	</el-table>
				</div>
				<div v-if="!tabActiveFlag && !tableFlag" style="height:158px">
					<el-table key="directiveTable" ref="directiveTable" :data="directivedata" height="155" style="width: 100%"
							v-loading="tableLoadOrder" element-loading-text="拼命加载中">
					    <el-table-column align="center" prop="carNum" label='车牌号'></el-table-column>
					    <el-table-column align="center"  label="执行状态">
					    	<template slot-scope="scope">
								<div v-if="scope.row.execStatus == -1">待执行</div>
								<div v-else-if="scope.row.execStatus == 0">失败</div>
								<div v-else-if="scope.row.execStatus == 1">成功</div>
								<div v-else>未知</div>
							</template>
					    </el-table-column>
					    <el-table-column align="center" prop="oper" label="操作人"></el-table-column>
					    <el-table-column align="center" prop="operDate" label="操作时间"></el-table-column>
					    <el-table-column align="center" label="指令类型">
					    	<template slot-scope="scope">
								<div v-if="scope.row.orderType == 'lastLocaltion'">
									车辆最后位置
								</div>
								<div v-else-if="scope.row.orderType == 'localtionTrack'">
									地图跟随
								</div>
								<div v-else>
									未知
								</div>
							</template>
					    </el-table-column>
					    <el-table-column align="center" prop="phone" label="手机号"></el-table-column>
				  	</el-table>
				</div>
			</div> 
			<el-row>
			  	<el-col :span="24">
			  		<div class="grid-content bg-purple-light right-show">
			  			<ul>
			  				<li>
			  					<!-- <el-button @click.native.prevent="orderText">文本下发</el-button>
			  					<em></em> -->
			  					<el-button @click.native.prevent="setParam">设置</el-button>
			  					<em></em>
			  					<el-badge v-show="alarmNum > 0" :value="alarmNum"  class="item alarm-btn"></el-badge>
								<el-button size="small" @click.native.prevent="openAlarmBox" class="alarmBtn">报警</el-button>
			  				</li>
			  			</ul>
			  		</div>
			  	</el-col>
			</el-row>
			<!--报警内容弹框  start-->
			<div class="alarm-box" v-show="alarmVisible == true">
				<div class="alarm-title">
					<ul>
						<li class="fl">报警提醒</li>
						<li class="fr">
							<i class="el-icon-error" @click="closeAlarmBox"></i>
						</li>
					</ul>
				</div>
				<div class="alarm-lists">
					<div v-for="item in alarmLists" :key="item.alarmId" class="alarm-list">
						<ul>
							<li>{{item.startTime}}</li>
							<li>
								车辆<span style="color:#ff9b00;margin: 0 5px;">{{item.carNum}}</span>
								<span v-if="item.startAddress" style="color:#333">在{{item.startAddress}}发出</span>
								<span v-else style="color:#333">在未知位置发出</span>
								<span>{{convertAlarmType(item.alarmType)}}</span>
							</li>
							<li><span @click="checkPosition(item.alarmId)">查看位置</span></li>
							<li>
								<span @click="readAlarm(item.alarmId, $event)" >标记为已读</span>
							</li>
						</ul>
					</div>
				</div>
				<p>
					<span @click="queryMoreTable">点击查看更多</span>
				</p>
			</div>
			<!--报警内容显示框  end-->
		</div>
		<span class="clear"></span>
		
		<!--参数设置弹框-->
		<el-dialog 
		title="参数设置" 
		:visible.sync="setFormVisible" 
		@close="cancelSet"
		top="10%" width="500px" 
		lock-scroll class="boxres setting"
		:close-on-click-modal="false"
        :close-on-press-escape="false">
			<el-tabs type="border-card" class="myTab">
			  	<el-tab-pane label="地图参数">
			  		<div>
			  			<el-form ref="mapSetForm"  :model="mapFormTemp" :rules="mapSettings"  class="small-space" label-position="left" label-width="130px">
			  				<el-form-item label="GPS刷新间隔(秒):">
								<el-select placeholder="请选择" v-model="mapFormTemp.gpsInterval">
									<el-option value="30">30</el-option>
									<el-option value="50">50</el-option>
									<el-option value="100">100</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="启用标记点聚合:">
								<el-radio-group v-model="mapFormTemp.aggFlag" @change.native.prevent="changeMapClus">
							        <el-radio label="1">是</el-radio>
									<el-radio label="0">否</el-radio>
							    </el-radio-group>
							</el-form-item>
							<el-form-item label="最大聚合级别:" >
								<el-select placeholder="请选择" v-model="mapFormTemp.aggLevel" :disabled="mapFormTemp.aggFlag==0">
									<el-option value="3" label="50m"></el-option>
									<el-option value="4" label="100m"></el-option>
									<el-option value="5" label="200m"></el-option>
									<el-option value="6" label="500m"></el-option>
									<el-option value="7" label="1km"></el-option>
									<el-option value="8" label="2km"></el-option>
									<el-option value="9" label="5km"></el-option>
									<el-option value="10" label="10km"></el-option>
									<el-option value="11" label="20km"></el-option>
									<el-option value="12" label="25km"></el-option>
									<el-option value="13" label="50km"></el-option>
									<el-option value="14" label="100km"></el-option>
									<el-option value="15" label="200km"></el-option>
									<el-option value="16" label="500km"></el-option>
									<el-option value="17" label="1000km"></el-option>
									<el-option value="18" label="2000km"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="最小聚合数量:" prop="aggNum">
								<el-input  v-model="mapFormTemp.aggNum" placeholder="最小聚合数量" :disabled="mapFormTemp.aggFlag==0"></el-input>
							</el-form-item>
							<el-form-item label="位置解析类型：">
								<el-select placeholder="请选择" v-model="mapFormTemp.parseMap">
									<el-option value="1" label="百度"></el-option>
									<el-option disabled value="2" label="谷歌"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="车牌号是否显示：">
								<el-radio-group v-model="mapFormTemp.carnumShow">
								    <el-radio label="1">显示</el-radio>
								    <el-radio label="0">不显示</el-radio>
								</el-radio-group>
							</el-form-item>
			  			</el-form>
			  			<div slot="footer" class="dialog-footer">
							<el-button @click.native.prevent="cancelSet">取 消</el-button>
							<el-button type="primary" @click.native.prevent="mapSet" class="btnColor">确 定</el-button>
						</div>
			  		</div>
			  	</el-tab-pane>
			  	<el-tab-pane label="报警参数">
			  		<div class="alarm-param">
			  			<el-form :model="setForm" class="small-space" label-position="left" label-width="150px">
			  				<el-form-item label="报警刷新间隔(秒)：">
								<el-select placeholder="请选择"  v-model="setFormTemp.alarmInterval">
									<el-option value="10">10</el-option>
									<el-option value="20">20</el-option>
								</el-select>
							</el-form-item>
			  			</el-form>
			  			<div slot="footer" class="dialog-footer">
							<el-button @click.native.prevent="cancelSet">取 消</el-button>
							<el-button type="primary" @click.native.prevent="setConfig('alarm')" class="btnColor">确 定</el-button>
						</div>
			  		</div>
			  	</el-tab-pane>
			</el-tabs>
		</el-dialog>

		<!-- 查看位置组件 -->
		<seate ref="child" :seateVisible="seateVisible"  @changeSeate="changeSeates($event)"></seate>
		<!-- 指令下发菜单 -->
		<div ref="menu1" class="rightmenu" @mouseleave="IsMenuShow = false" v-show="IsMenuShow">
			<p @click.prevent="carLastSeat">车辆最后位置</p>
			<p @click.prevent="mapFollowVisible = true">地图追随</p>
			<p @click.prevent="orderText">文本下发</p>
		</div>
		<div ref="depMenu" class="rightmenu" @mouseleave="IsDepMenuShow = false" v-show="IsDepMenuShow">
			<p @click.prevent="orderText">文本下发</p>
		</div>
		<!-- 地图追随form表单 -->
		<el-dialog 
		title="地图追随" 
		:visible.sync="mapFollowVisible" 
		top="10%" width="500px" 
		lock-scroll class="boxres setting"
		:close-on-click-modal="false"
        :close-on-press-escape="false">
			<el-form :model="carFollow" class="small-space" label-position="left" label-width="150px">
				<div style="margin-left:50px;">
					<el-form-item label="时间间隔(秒)：" style="margin-top:20px;">
						<el-select placeholder="请选择"  v-model="carFollow.timeInterval">
							<el-option value="10">10</el-option>
							<el-option value="20">20</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="位置跟踪有效期(秒)：">
						<el-select placeholder="请选择"  v-model="carFollow.validDate">
							<el-option value="60">60</el-option>
							<el-option value="100">100</el-option>
							<el-option value="150">150</el-option>
						</el-select>
					</el-form-item>
				</div>
  			</el-form>
  			<div slot="footer" class="dialog-footer" style="margin-right:138px">
				<el-button @click.native.prevent="cancelFollow">取 消</el-button>
				<el-button type="primary" @click.native.prevent="setFollow" class="btnColor">确 定</el-button>
			</div>
		</el-dialog>

		<issued-text :isShow="textDialogVisible" @closeDialog= "closeIssuedDialog" :carList="issuedTextCarList"></issued-text>

	</div>
</template>
<script type="text/javascript">
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';
	import {api} from 'src/global/api';
	import Seate from '../../components/Seate';//查看位置组件
	import IssuedText from '../../components/issuedText';// 下发文本组件

	export default {
		components: {
			'seate':Seate,//查看位置组件
			'issued-text':IssuedText,//文字下发组件
		},
		watch: {
	      	filterText(val) {
				this.showTreeNodeId = [];
	        	this.$refs.tree2.filter(val);
	      	}
	    },
	    data() {
	    	const vm = this;
			//新增校验 拍照（为关闭） 拍照摄像头不做校验
			const validateClustererMin = (rule, value, callback) => {
				if(vm.mapFormTemp.aggFlag == '1'){
					if(value){
						const reg = /^[0-9]+$/;
				        let falg = reg.test(value);
				        if (!falg || parseInt(value) < 2) {
				            callback(new Error('请输入大于2的正整数'));
				        } else {
				            callback();
				        }
					}else{
						callback(new Error('不为空'));
					}
				}else{
					callback();
				}
		    };
			return {
				//查看位置数据
	     		seateVisible:{
					alarmId: '',//告警Id
					dialog: false,//弹框是否显示
					tables: false//列表
	     		},
				heightData: '500px',
				mapHeight: '450px',
				treeHeight: '500px',
				map: null,
				carId:"",//选择的车辆ID
				carNum:"",//选择的车辆编号
				textData: "",
				imgsTypeVisible: false,
				filterText: '',
				treeData: [],//树数据
				disabledTree: [],//不可点击的树节点
				//自定义树的属性
		        defaultProps: {
		            children: 'children',
		            label: 'deptName'
				},
				IsDepMenuShow: false, // 部门右键菜单
				showTreeNodeId: [],
				setFormVisible: false,//设置弹框
				alarmVisible: false,//警告弹框
				GPSdata: [],//GPS表格信息
				notActive:0,//未激活数量	
				offline:0,//离线数量		
				online:0,//在线数量			
				allCarNum:0,//车辆总数	
				carIds: [],//选中车辆的ID数组		
				alarmLists: [],//报警数据
				alarmNum: 0,//显示报警的数量  top5
				directivedata: [],//指令信息table

				//报警间隔刷新(当前有效值)
				setForm: {
					alarmInterval: 20
				},
				//地图参数(当前有效值)
				mapForm: {
					gpsInterval: 50,//GPS刷新间隔 单位秒 
					aggFlag: '1',//启用聚合  1是  0否
					aggLevel: '10',//最大聚合级别   
					aggNum: '2',//聚合最小数量  
					parseMap: '1',//位置解析类型 百度  谷歌 
					carnumShow: '1'//1:显示 0 不显示
				},
				//报警间隔刷新(绑定变量)
				setFormTemp: {
					alarmInterval: 20
				},
				//用来和组件绑定的变量
				mapFormTemp: {
					gpsInterval: 50,//GPS刷新间隔 单位秒 
					aggFlag: '1',//启用聚合  1是  0否
					aggLevel: '10',//最大聚合级别   
					aggNum: '2',//聚合最小数量  
					parseMap: '1'//位置解析类型 百度  谷歌 
				},

				timer:null,//报警定时刷新
				carTimer:null,//车辆定时刷新
				mapTimer:null,//地图追随定时器
	
				//地图参数校验
				mapSettings:{
					aggNum: [
						{ required: true, trigger: 'blur', validator: validateClustererMin}
					],
				},
				markerClusterer: null,//聚合变量
				tableFlag: true,//展开关闭状态
				tabActiveFlag: true,//按钮是否选中 控制class样式
				IsMenuShow: false,//指令下发菜单
				orderCarId: "",//车辆最后位置  车辆ID
				//地图追随
				mapFollowVisible:false,//form表单弹框是否展示
				carFollow:{
					timeInterval:10,//时间间隔 秒
					validDate:60//位置跟踪有效期
				},
				//文字下发
				textDialogVisible: false, // 下发文本弹窗显示隐藏
				issuedTextCarList:[],
				carIdOrder:[],//地图追随打点
				treeLoad: false,//树loading状态
				tableLoadGps: false,//gps able
				tableLoadOrder: false,//指令table

				defaultOpenNodes: [],
				allCarArr: [],//所有车辆数组
				offlineCarArr: [],//离线车辆数组
				offlineCarArr: [],//离线车辆数组
				liClass: 1,
			}
		},
		mounted(){
			var vm = this;
			utils.getTableHeight((height) => {
				let h = $('.sidebar-wrapper').height() - 20;  //左侧路由高度
				let videoHeight = $('.sidebar-wrapper').height() - 60;  //左侧路由高度
				let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;//浏览器高度
				vm.heightData = h + 'px';
				vm.mapHeight = h - 42 + 'px';
				vm.treeHeight = h - 158 + 'px';
			});
			//阻止树上的的右击事件
			vm.$refs.tree2.oncontextmenu = function(){
			　　return false;
			}
			vm.initMap();//初始化地图
			vm.initDepart('first');//获取车队列表以及车辆数目
			vm.getAlarmTopData();//获取报警数据
			vm.getConfig();//获取配置参数
			//加载报警
			utils.loadAlarmType(vm);
			// 递归 查找所有部门ID
			Array.prototype.each = function(fn){                                                                                   
				if(this.length >0){                                                               
					for(var i = 0; i< this.length; i++ ) {
						var e = this[i];
						if(e.type == 0){
							fn.call(e,e)
							if(e.children && e.children.constructor == Array){
								e.children.each(fn);      
							}	
						}						                                                                                  					                                                                                                                    
					}                                                                                     					                                                                                       
				}                                                                             																								                                                                                                                                                    
			}  
			//点击页面空白处，报警弹出框隐藏
			$(document).bind("click", function(e) {
				var target = $(e.target);
				if(target.closest(".alarm-box, .alarmBtn, .seate").length == 0) {
					vm.alarmVisible = false;
				};
				e.stopPropagation();
			})
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			if(this.timer){
				this.timer = clearInterval(this.timer); //去掉定时器的方法   同一个变量做定时器
			}
			if(this.carTimer){
				this.carTimer = clearInterval(this.carTimer); //去掉定时器的方法   同一个变量做定时器
			}
			if(this.mapTimer){
				this.mapTimer = clearInterval(this.mapTimer); //去掉定时器的方法   同一个变量做定时器
			}
		},
		methods:{
			//初始化地图
			initMap() {
				var vm = this;
				// 百度地图API功能
				vm.map = new BMap.Map("carGps");    // 创建Map实例
				vm.map.centerAndZoom("北京", 5);  // 初始化地图,设置中心点坐标和地图级别
				vm.map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
				vm.map.enableScrollWheelZoom();     //开启鼠标滚轮缩放				
			},
			//GPS告警信息转成文字
			convertAlarmType(type) {
				return utils.convertAlarmType(type, this);
			},
			//位置的逆解析
			setPosition(address,lng, lat){
				let seat ="";
				if(address){
					seat = address[lng +"_"+lat];
				}else{
					seat = "该车辆的经纬度解析不了";
				}
				console.log(address);
				return seat;
				/*let address = "";
				if(lng && lat){
					const vm = this;
					let point = new BMap.Point(lng,lat);
					vm.$store.dispatch('GetLocation', point);//逆解析经纬度
					address = vm.$store.getters.address;//获取逆解析地址
					if(!address){
						address = "该车辆的经纬度解析不了";
					}
				}else{
					address = '经纬度为空';
				}
				return address;*/
			},
			//获取报警弹框的数据
			getAlarmTopData(){
				const vm = this;
				let params = {};
				params.flags =  true;
				vm.$instance.get("/proxy/lbs/car/findAlarmTop", {param: params}).then(res =>{
		          	if(res.status == 200){
						console.log("告警top5");
						console.log(res.data);
		                vm.alarmLists = res.data;
		                if(res.data != undefined && res.data.length != undefined){
							vm.alarmNum = res.data.length;
		                }
		                if(vm.alarmNum == 0){
							vm.alarmVisible = false;
						}
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {});
			},
			//报警弹框内标记为已读
			readAlarm(alarmId, event){
				const vm = this;
				let _this = event.target;
				if(_this.innerHTML == "标记为已读"){
					vm.handleAlarm(alarmId, true);//告警信息处理已读
				} else {
					return;
				}
			},
			//关闭查看位置弹框
		    changeSeates(param){
		    	const vm = this;
		    	vm.seateVisible.dialog = param;
		    },
			//查看报警位置
			checkPosition(alarmId){
				if(alarmId){
					this.seateVisible.alarmId = alarmId;
					this.seateVisible.dialog = true;//显示查看信息弹框
					this.$refs.child.initAlarm(); // 告警信息
					this.handleAlarm(alarmId, false);//告警信息处理已读
				}
			},
			//点击查看位置  自动处理为已读
			handleAlarm(alarmId, isToolTip = true){
				const vm = this;
				let alarmIdsArr = [];
				alarmIdsArr.push(alarmId);
				let param = {
					alarmIds : alarmIdsArr,
				};
				vm.$instance.post("/proxy/lbs/alarm/handleAlarm", param).then(res =>{
		          	if(res.status == 200){
						if (isToolTip) {
							Message.success({message:"告警信息标为已读"});
						}
						vm.getAlarmTopData();
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        });
			},
			//告警信息查看更多
			queryMoreTable(){
				this.$router.push({path: '/lbs/AlarmManage', query: {flag: true}});//带参传递
			},
			//车辆信息提示框的显示隐藏
			tipImgsToggle() {
				this.imgsTypeVisible = !this.imgsTypeVisible;
			},
			//确定选择车辆
			getCar(nodes){
				if(nodes.deptId){
					this.carId = nodes.deptId;//选中的车ID
					this.carNum = nodes.deptName;//车牌号
					this.departData.dialog = false;
				}
			},
			//子节点取消
			clearCar(param){
				this.carId = "";//选中的车ID
				this.carNum = "";
			},
			nodeExpand(data, node, index) {
				this.defaultOpenNodes.push(data.id);
			},
			nodeCollapse(data, node, index) {
				var index = this.defaultOpenNodes.indexOf(data.id);

				if (index > -1) {
					this.defaultOpenNodes.splice(index, 1);
				}
			},
			//获取车队列表以及车辆数目
		    initDepart(type = ""){
		        let vm = this;
		        vm.treeLoad = true;
		        vm.$instance.get("/proxy/lbs/car/findCarTree").then(res =>{
		            if(res.status == 200){
                        console.log("车辆定时器");
                        console.log(res.data);
                        vm.notActive = res.data.notActive;//未激活数量
                        vm.offline = res.data.offline;//离线数量
                        vm.online = res.data.online;//在线数量
                        vm.allCarNum = res.data.notActive + res.data.offline + res.data.online;//车辆总数
                        //没有车辆的部门不可选择
                        /*vm.disabledTree =[];
                        vm.disabledTreeNode(res.data.treeData,vm);//树数据进行处理*/
						/*vm.treeData = vm.disabledTree;*/
						vm.treeData = res.data.treeData;
						vm.allCarArr = [];//所有车辆数组
						vm.onlineCarArr = [];//在线车辆数组
						vm.offlineCarArr = [];//离线车辆数组
						vm.getCar(vm.treeData,vm);
						if ('first' == type) {
							vm.defaultOpenNodes = [];
							vm.defaultOpenNodes.push(vm.treeData[0].id);
						}
						
						// debugger;
                        //设置树的选中状态
                        if (vm.$refs.tree2) {
                        	if(vm.carIds.length > 0){
                        		vm.carIdOrder = [];
                        		vm.$refs.tree2.setCheckedKeys(vm.carIds);
                        	}
                            if(vm.carIdOrder.length > 0){
								vm.$refs.tree2.setCheckedKeys(vm.carIdOrder);
                            }
                        }
                        //有过滤，触发过滤
                        if (vm.filterText != "") {
                            window.setTimeout(function() {
                                vm.showTreeNodeId = [];
                                vm.$refs.tree2.filter(vm.filterText);
                            }, 1);
                        }
                        resolve();//异步操作成功
		            }else{
		               Message.error(res.data.errorMsg);
		            }
		            vm.treeLoad = false;
		        }).catch(error => {vm.treeLoad = false;});
		    },
		    //获取所有的车辆ID、在线车辆、离线车辆
		    getCar(data,vm){
				if(data.length > 0){
					$.each(data, function(idx, obj) {
						//部门
			    		if(obj.type == 0){
			    			if(obj.children.length > 0){
								vm.getCar(obj.children,vm); //递归函数 遍历树
			    			}
			    	    //车辆
			    		}else{
			    			//0：离线 1：在线 2：怠速 3：告警 4：未激活
			    			vm.allCarArr.push(obj.carId);
			    			if(obj.status == 0){
			    				vm.offlineCarArr.push(obj.carId);
			    			}else if(obj.status == 1){
								vm.onlineCarArr.push(obj.carId);
			    			}
			    		}
					});
				}
		    },

		    //定时刷新车队列表、地图上打点、GPS/指令table
		    carRefresh(){
		    	const vm =this;
		    	//gps参数设置定时器
				if(this.carTimer){
					this.carTimer = clearInterval(this.carTimer); //去掉定时器的方法   同一个变量做定时器
				}
				if(this.mapTimer){
					this.mapTimer = clearInterval(this.mapTimer); //去掉定时器的方法   同一个变量做定时器
				}
				vm.carTimer = setInterval(function(){
					vm.initDepart();
					//判断车辆ID数组是否为空
					if(vm.carIds.length > 0){
						vm.carIdOrder = [];
						vm.initMapAndTable(vm.carIds, null, true);
					}else{
						//gps定时刷新 遇到地图追随不需要清空打点
						if(!vm.orderCarId){
							vm.map.clearOverlays(); //清除marker
				          	if(vm.markerClusterer){
				          		vm.markerClusterer.clearMarkers(); //清除聚合
				          	}
							vm.GPSdata =[];
							vm.directivedata =[];
						}
					}
				},parseInt(vm.mapForm.gpsInterval) * 1000);// 同一个变量做定时器
		    },
		    //没有车辆的部门不可选择
		    disabledTreeNode(data,vm){
		    	$.each(data, function(idx, obj) {
		    		if(obj.type == 0){
		    			if(obj.children.length > 0){
		    				vm.disabledTree.push(obj);
							vm.disabledTreeNode(obj.children,vm); //递归函数 遍历树
		    			}else{
		    				obj.disabled = true;
		    				vm.disabledTree.push(obj);
		    			}
		    		}else{
		    			//车辆未激活  不可点击
		    			if(obj.status == 4){
							obj.disabled = true;
		    				vm.disabledTree.push(obj);
		    			}
		    		}
				});
		    },
          	//搜索树
          	filterNode(value, data) {
				if (!value) return true;
                var parentShow = this.showTreeNodeId.indexOf(data.id) !== -1;
				var show = data.name.indexOf(value) !== -1;
				if (show || parentShow) {
					this.showTreeNodeId.push(data.id);
					//将子集的ID都放到showTreeNodeId数组里面
					if(data.children){
						for(let index of data.children){
							this.showTreeNodeId.push(index.id);
						}
					}
                }
				return parentShow || show;
		    },
		    
			//树回调  添加车辆的状态
			renderContent(h, {node,data,store}) {
				//type  1 车辆 0 组织机构
				if (data.type == 1) {
					//0：离线 1：在线 2：怠速 3：告警 4：未激活
					var classStr = '';
					switch(data.status) {
						case 0: {
							classStr = 'car-img caroutline';
						}
						break;
						case 1: {
							classStr = 'car-img caronline';
						}
						break;
						case 2: {
							classStr = 'car-img carstop';
						}
						break;
						case 3: {
							classStr = 'car-img cartip';
						}
						break;
						case 4: {
							classStr = 'car-img carnoactive';
						}
						break;
						default: break;
					}
					return(
						<span class="custom-tree-node">
							<span class={classStr}></span>
							<span class="strongTree" title={data.name}>{data.name}</span>
						</span>
					);
				} else {
					return(
						<span class="custom-tree-node">
							<span class="strongTree" title={data.name}>{data.name}</span>
						</span>
					);
				}
			},
			//参数设置
			setParam(){
				var vm = this;
				vm.setFormVisible = true;
				vm.alarmVisible = false;//告警关闭
			},
			//显示报警列表弹框
			openAlarmBox(){
				const vm = this;
				if(vm.alarmNum == 0){
					vm.alarmVisible = false;
					this.$message({
			          	message: '暂无报警数据',
			          	type: 'warning',
			          	duration: '1500'
			        });
				}else{
					vm.alarmVisible = true;
					// $('.alarm-box').animate({right:"2%"}, 500);
				}
			},
			//关闭报警列表弹框
			closeAlarmBox(){
				this.alarmVisible = false;
				// $('.alarm-box').css({right:"-500px"});
			},
			//树节点点击
			handleNodeCheck(data) {
				let vm = this;
				let nodesIds = this.$refs.tree2.getCheckedNodes();//获取所有的选中节点
				vm.carIds = [];//选中车辆ID
				// vm.issuedTextCarList = [];//文字下发
				$.each(nodesIds, function(index, obj) {
					if(obj.type == 1){
						vm.carIds.push(obj.carId);
						// vm.issuedTextCarList.push(obj);
					}
				});
				this.initMapAndTable(this.carIds, null, false);//地图添加车辆点、table信息
				vm.setMapZoom(data);//放大地图
		    },
			/**
			 * @des  选中车辆的信息
			 * @param <Array> param 选中车辆ID
			 * @param <String> type 类型：order 指令打点、gps、指令（不是order就只打点加载gps）
			 * @return <Boolean> 看xxx是否成功
			 */
			initMapAndTable(param, type, isTimer){
				//this.carIds = [...new Set(param)];//去重
				console.log(this.carIds);
				//判断车辆ID数组是否为空
				if(this.carIds.length > 0){
					this.getGpsTable(this.carIds, type, isTimer);//GPS table信息
					/*if(type == "order"){
						this.getDctTable(this.carIds);//指令table信息
					}*/
				}else{
					//gps定时刷新 遇到地图追随不需要清空打点
					if(!this.orderCarId){
						this.map.clearOverlays(); //清除marker
			          	if(this.markerClusterer){
			          		this.markerClusterer.clearMarkers(); //清除聚合
			          	}
						this.GPSdata =[];
						this.directivedata =[];
					}
					
				}
			},
			//GPS table信息
			getGpsTable(datas, type, isTimer = false){
				const vm = this;
				vm.tableLoadGps = true;
				let param = {};
				param.carIds = datas;
				param.flags =  true;
				
	          	if(!type && vm.mapTimer){
					vm.mapTimer = clearInterval(vm.mapTimer); //去掉定时器的方法   同一个变量做定时器
				}
				this.map.clearOverlays(); //清除marker
	          	if(this.markerClusterer){
	          		this.markerClusterer.clearMarkers(); //清除聚合
	          	}
				//vm.$instance.get("/proxy/lbs/car/findGpsByCarIds", {params: param}).then(res =>{
				vm.$instance.post("/proxy/lbs/car/findGpsByCarIds", param).then(res =>{
					console.log("table",res);
		          	if(res.status == 200){
		          		if(res.data.length < datas.length && !isTimer){
							vm.tableLoadGps = false;
		          			Message.warning({message:(datas.length - res.data.length) +"个设备暂无数据！"});
		          			if(res.data.length == 0){
		          				vm.tableFlag = true;
				                vm.GPSdata =[];
								vm.directivedata =[];
								return;
		          			}
						}
						let geoc = new BMap.Geocoder();//百度地图逆解析
						let ptArr = new Array();
						let markers = [];
						let i = 0;
						for(let obj of res.data){
							//84转百度
							var bd09 = utils.wgs84tobd09(obj.longitude, obj.latitude);
							obj.longitude = bd09[0];
							obj.latitude = bd09[1];
							let pt = new BMap.Point(obj.longitude , obj.latitude);
							//地址逆解析是异步的  当所有地址逆解析完毕  在加载table
							utils.getAddress(geoc, pt, (address)=> {
								obj.address = address;
								i++;
								if (i == res.data.length) {
									vm.GPSdata = res.data;//gps table数据
									vm.tableLoadGps = false;
				                	vm.tableFlag = false;
								}
							});
							//未定位或者  经纬度是0   不打点
							if(obj.lbsFlag != 0 && obj.longitude != 0 && obj.latitude != 0 ){
								ptArr.push(pt);//打点经纬度数组
							}
							vm.clustererOrMarker(pt, vm, obj, markers, type, obj.carNum, obj.lbsFlag);//聚合或者打点
						}
		                if(markers.length > 0){
							//启用聚合  1是  否
							vm.map.clearOverlays();
		                	if(vm.mapForm.aggFlag == '1'){
								//当聚合只有一个点  地图放大
								//定时器不需要设置地图大小
								if (!isTimer) {
									if(markers.length > 1){
										vm.map.centerAndZoom(new BMap.Point(104.92,33.4),6);//地图放大级别6  中心点为甘肃省陇南市
									}else{
										vm.map.centerAndZoom(new BMap.Point(markers[0].point.lng,markers[0].point.lat),18);
									}
								}
		                		
								//最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
								if(vm.markerClusterer){
									vm.markerClusterer.clearMarkers(); //清除聚合
									vm.markerClusterer.addMarkers(markers);
								} else {
									vm.markerClusterer = new BMapLib.MarkerClusterer(vm.map, {
										markers: markers,
										minClusterSize: vm.mapForm.aggNum,//最小的聚合数量，小于该数量的不能成为一个聚合，默认为2
										maxZoom: vm.mapForm.aggLevel,//最大的聚合级别，大于该级别就不进行相应的聚合
										//isAverangeCenter: true,//聚合点的落脚位置是否是所有聚合在内点的平均值，默认为否，落脚在聚合内的第一个点
									});
								}
					        }else{
					        	vm.map.centerAndZoom(new BMap.Point(markers[0].point.lng,markers[0].point.lat),12);	
					        	for (let i = 0; i < markers.length; i ++) {
									vm.map.addOverlay(markers[i]); //增加点
								}
								vm.map.setViewport(ptArr); //将所有的点放置在最佳视野内
					        }
		                }
		            }else{
		                Message.error({message:"调用接口失败"});
		                vm.tableFlag = true;
		                vm.GPSdata =[];
						vm.directivedata =[];
						vm.tableLoadGps = false;
		            }
		        }).catch(error => {
		        	vm.tableLoadGps = false;
		        });
			},
			/**
			 * @des  聚合或者打点
			 * @param <Object> pt 坐标
			 * @param <Object> vm this(vue对象)
			 * @param <Object> obj 循环每条数据所有对象
			 * @param <String> type 指令 地图追随
			 * @param <Array> markers 数组存放聚合的marker
			 * @param <String> carNum 车牌号
			 */
			clustererOrMarker(pt, vm, obj, markers, type,carNum,lbsFlag){
				let myIcon =null;//marker图标
				if(type == "order"){
					myIcon = new BMap.Icon(require("assets/img/map-follow.png"), new BMap.Size(30,30));//地图追随 
				}else{
					if(obj.online == 0){
						myIcon = new BMap.Icon(require("assets/img/map-out.png"), new BMap.Size(30,30));//0：离线 
			        }else if(obj.online == 1){
						myIcon = new BMap.Icon(require("assets/img/map-online.png"), new BMap.Size(30,30));//1：在线 
			        }else if(obj.online == 2){
						myIcon = new BMap.Icon(require("assets/img/map-stop.png"), new BMap.Size(30,30));//2：怠速
			        }
				}
		        let marker = new BMap.Marker(pt,{icon:myIcon});
		        
				if(vm.mapFormTemp.carnumShow == 1){
					let label = new BMap.Label(carNum,{offset:new BMap.Size(-25,-40)});
					label.setStyle({ 
						display:"block",  //给label设置样式，任意的CSS都是可以的
						fontSize: "14px",
						backgroundColor: "#586FCC",
						color: "#fff",
						borderRadius: "10px",
						borderColor: "#586FCC",
						height: "40px",
						lineHeight: "40px",
						padding: "0px 10px",
						zIndex: 1000000
					});
					marker.setLabel(label);
				}
		        vm.addClickHandler(obj, marker, vm, pt); //百度地图添加事件
		        //未定位或者  经纬度是0   不打点
				if(lbsFlag != 0){
					if(type == "order"){
			        	vm.map.centerAndZoom(new BMap.Point(marker.point.lng,marker.point.lat),17);	
						vm.map.addOverlay(marker);    //增加点
						vm.map.setViewport(marker); //将所有的点放置在最佳视野内
			        }else{
			        	markers.push(marker);
			        }
				}
			},
			/**
			 * @des  marker点 点击车辆信息出来
			 * @param <Object> obj 循环每条数据所有对象
			 * @param <Object>  marker经纬度
			 * @param <Object> vm this(vue对象)
			 * @param <Object> pt 坐标
			 */
			addClickHandler(obj, marker, vm, pt){
				//acc开关 0：关闭 1：打开
				obj.acc = utils.accFlagToStr(obj.acc);

				obj.lbsFlag = utils.lbsFlagToLbsStr(obj.lbsFlag)
				let span1 = "";
				if(obj.online == 2){
					var minute = Math.floor(obj.idlingTime/60);
		            span1 = " 怠速"+ (minute != 0 ? minute +"分" : "") + obj.idlingTime%60 +"秒";
				}
				obj.online = utils.onlineFlagToStr(obj.online);

				obj.direation = utils.angleToDireation(obj.direation);

				let content = "<div class='mapDialog'>"
					+ "<span class='BMap_car_title' title=" + obj.carNum + ">" + obj.carNum + "</span> "// 信息窗口标题 车牌号
					+ "<span class='simSignalIconClass " + utils.getSimSignalClass(obj.simSignal) + "'></span> "
					+ "<span class='satelliteIcon'></span><span>" + obj.satelliteNum + "个</span> "
					+ "</div>"
					+ "<div class='mapDialog'>定位状态：" + obj.lbsFlag + "</div>"
					+ "<div class='mapDialog'>定位时间：" + obj.gpsTime + "</div>"
					+ "<div class='mapDialog'>通讯时间：" + obj.linkTime + "</div>"
					+ "<div class='mapDialog'>速度：" + obj.speed + "km/h" + "(" + obj.direation + ")</div>"
					+ "<div class='mapDialog'>里程：" + obj.mileage + "km</div>"
					+ "<div class='mapDialog'>状态：(" + obj.online + ")" + obj.acc + (span1 != ""? span1: "") + "</div>"
				 
			    //添加弹框
		        var opts = {
		          width : 0,     // 信息窗口宽度
		          height: 0,     // 信息窗口高度
//		          title : obj.carNum, // 信息窗口标题 车牌号
		          //enableMessage:true,//设置允许信息窗发送短息
		          message:""
		        }
		        //点击事件 车辆信息出来
				marker.addEventListener("click",function(e){
				  	var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象 
					vm.map.openInfoWindow(infoWindow,pt); //开启信息窗口
					infoWindow.addEventListener("close",function(e){
						if (marker.getLabel()) {
							marker.getLabel().setStyle({    
								display:"block"
							});
						}
					});
					if (marker.getLabel()) {
						marker.getLabel().setStyle({    
							display:"none"
						});
					}
				});
				//手表划过，将车辆提到前面
				marker.addEventListener("mouseover",function(e){
					marker.setTop(true);
				});
				marker.addEventListener("mouseout",function(e){
					marker.setTop(false);
				});
			},
			//指令table信息
			getDctTable(datas){
				const vm = this;
				let param = {};
				param.carIds = datas;
				vm.tableLoadOrder = true;
				vm.$instance.get("/proxy/lbs/car/findOrdersByCarId", {params: param}).then(res =>{
					console.log("指令",res);
					vm.tableLoadOrder = false;
		          if(res.status == 200){
			          	//将 车辆ID赋值到 指令table中
					    /*res.data.forEach(key => {
				            key.carId = param.carIds[0];
				        });*/
						res.data[0].carId = param.carIds[0];
		                vm.directivedata = res.data;
						vm.tableFlag = false;
		            }else{
		                Message.error({message:"调用接口失败"});
		                vm.tableFlag = true;
		                vm.GPSdata =[];
						vm.directivedata =[];
		            }
		        }).catch(error => { vm.tableLoadOrder = false;});
			},
			//设置取消
			cancelSet(){
				const vm = this;
				vm.setFormVisible = false;
				//视图绑定变量恢复原始值
				vm.mapFormTemp = JSON.parse(JSON.stringify(vm.mapForm));
				vm.setFormTemp = JSON.parse(JSON.stringify(vm.setForm));
			},
			//是否聚合
			changeMapClus(){
				console.log(this.mapFormTemp.aggFlag);
				if(this.mapFormTemp.aggFlag == '1'){
					this.$refs.mapSetForm.validateField('aggNum');//单独校验
				}else if(this.mapFormTemp.aggFlag == '0'){
					this.$refs.mapSetForm.clearValidate();//移除校验结果
				}
			},
			//参数设置入库
			setConfig(param){
				const vm = this;
				let config = {};
				if(param == 'map'){
					config = vm.mapFormTemp;
				}else if(param == 'alarm'){
					config = vm.setFormTemp;
				}
				vm.$instance.post("/proxy/sysmgr/account/editConfig", config).then(res =>{
		          if(res.status == 200 && res.data.success){
		                if(param == "map"){
							//如果修改是否显示车牌号，车辆不为空  必须重新加载数据
							if (vm.mapFormTemp.carnumShow != vm.mapForm.carnumShow && vm.carIds && vm.carIds.length>0) {
								vm.getGpsTable(vm.carIds, "", true);
							}
							vm.mapForm = JSON.parse(JSON.stringify(vm.mapFormTemp));
							//如果有打点，必须更新设置内容
							if (vm.markerClusterer) {
								vm.markerClusterer.setMinClusterSize(vm.mapForm.aggNum);
								vm.markerClusterer.setMaxZoom(vm.mapForm.aggLevel);
							}
							vm.carRefresh();//定时刷新车队列表
							
							Message.success({message:"地图参数设置成功"});
						} else {
							vm.setForm = JSON.parse(JSON.stringify(vm.setFormTemp));
							vm.alarmSet();
							
							Message.success({message:"报警刷新间隔设置成功"});
						}
						this.setFormVisible = false;
		            }else{
						Message.error({message:"调用接口失败"});
						if(param == "map"){
							vm.mapFormTemp = JSON.parse(JSON.stringify(vm.mapForm));
						} else {
							vm.setFormTemp = JSON.parse(JSON.stringify(vm.setForm));
						}
		            }
		        }).catch(error => {
					if(param == "map"){
						vm.mapFormTemp = JSON.parse(JSON.stringify(vm.mapForm));
					} else {
						vm.setFormTemp = JSON.parse(JSON.stringify(vm.setForm));
					}
				});
			},
			//地图参数设置
			mapSet(){
				const vm = this;
				this.$refs.mapSetForm.validate((valid) => {
		          if (valid) {
					vm.setConfig('map');
		          } else {
		            return false;
		          }
		        });
			},
			//报警参数设置
			alarmSet(){
				if(this.timer){
					this.timer = clearInterval(this.timer); //去掉定时器的方法   同一个变量做定时器
				}
				this.timer = setInterval(this.getAlarmTopData, parseInt(this.setForm.alarmInterval) * 1000);// 同一个变量做定时器
			},
			//table tab点击切换
			changeTable(param){
				this.tableFlag = false;
				if(param == "gps"){
					this.tabActiveFlag = true;
				}else if(param == "order"){
					this.tabActiveFlag = false;
				}
			},
			//table tab点击切换
			changeIcon(param){
				if(param == "up"){
					this.tableFlag = false;
				}else if(param == "down"){
					this.tableFlag = true;
				}
			},
			//获取配置参数
			getConfig(){
				const vm = this;
				vm.$instance.get("/proxy/sysmgr/account/findConfig").then(res =>{
		          if(res.status == 200){
						vm.setForm.alarmInterval = !res.data.alarmInterval ? 20: res.data.alarmInterval;//报警间隔刷新
						vm.mapForm.gpsInterval = !res.data.gpsInterval ? 50: res.data.gpsInterval ;//GPS刷新间隔 单位秒 
						vm.mapForm.aggFlag = !res.data.aggFlag ? '1': res.data.aggFlag ;//启用聚合  0否 1是
						vm.mapForm.aggLevel = !res.data.aggLevel ? '10': res.data.aggLevel ;//聚合级别  0否 1是
						vm.mapForm.aggNum = !res.data.aggNum ? '2': res.data.aggNum ;//启用聚合  0否 1是
						vm.mapForm.parseMap = !res.data.parseMap ? '1' :  res.data.parseMap ;//地图  1百度  2谷歌
						vm.mapForm.carnumShow = !(res.data.carnumShow + "") ? '1' : res.data.carnumShow + "" ;//1:显示 0 不显示
			          	vm.carRefresh();//定时刷新车队列表
						vm.alarmSet();
						//视图绑定变量赋值
						vm.mapFormTemp = JSON.parse(JSON.stringify(vm.mapForm));
						vm.setFormTemp = JSON.parse(JSON.stringify(vm.setForm));
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { });
			},
			//显示指令
			showOrderMenu(event, data, value, node){
				if(data.type == 0){
					this.issuedTextCarList = [];
                    this.$refs.depMenu.style.left = (event.clientX) + 'px';
					this.$refs.depMenu.style.top = (event.clientY - 80) + 'px';
					this.IsDepMenuShow = true;
					let list = []
					let tree = this.$refs.tree2.getCheckedNodes();
					if(tree.length > 0 && data.children.length> 0){
						list.push(data.id);
						data.children.each(function(a){
                            list.push(a.id)
						})
						tree.forEach(item =>{
							if(item.type == 1){
                                if(list.toString().indexOf(item.pId) != -1){
								    this.issuedTextCarList.push(item)
							    }
							}
						})
					}
				}	
				this.orderCarId = "";
				// type 1 车辆  0 组织机构 离线车辆不可以下发指令 //0：离线 1：在线 2：怠速 3：告警 4：未激活
				if(data.status == 1 || data.status == 2 || data.status == 3 && data.type == 1) { // 菜单位置
					this.$refs.menu1.style.left = event.clientX + 'px';
					this.$refs.menu1.style.top = (event.clientY - 100) + 'px';
					this.IsMenuShow = true;//查询指令的车辆ID
					this.orderCarId = data.carId;//车辆ID
					this.issuedTextCarList = [];
					this.issuedTextCarList.push(data)
				}
			},
			//车辆最后位置
			carLastSeat(){
				const vm = this;
				let param={};
				param.carId = vm.orderCarId;//车辆ID
				console.log(param);
				vm.$instance.post("/proxy/lbs/car/downCmdLastLocaltion",param).then(res =>{
		          if(res.status == 200 && res.data.success){
			          	Message.success({message:"车辆最后位置指令下发成功"});
			          	vm.tabActiveFlag = false;//指令按钮选中
			          	let carIds = [];
			          	carIds.push(param.carId);
			          	vm.getDctTable(carIds);//获取指令信息
		            }else{
		                Message.error({message:res.data.errorMsg});
		            }
		        }).catch(error => { });
			},
			//取消地图追随
			cancelFollow(){
				console.log("取消地图追随");
				this.mapFollowVisible = false;
			},
			//设置地图追随
			setFollow(){
				console.log("设置地图追随");
				const vm = this;
				let param = JSON.parse(JSON.stringify(this.carFollow));
				param.carId = this.orderCarId;
				vm.$instance.post("/proxy/lbs/car/downCmdLocaltionTrack",param).then(res =>{
		          if(res.status == 200 && res.data.success){
			          	vm.carFollowMap(param);//地图追随
			          	Message.success({message:"地图追随指令下发成功"});
			          	vm.tabActiveFlag = false;//指令按钮选中
			          	let carIds = [];
			          	carIds.push(param.carId);
			          	vm.getDctTable(carIds);//获取指令信息
		            }else{
		                Message.error({message:res.data.errorMsg});
		            }
		        }).catch(error => { });

			},
			//地图追随打点  位置跟随有效期内进行定时刷新
			carFollowMap(){
				//ES6提供了Array.includes()函数判断是否包含某一元素includes  true 包含  false 不包含
				//地图追随的时候   树选择也只有当前的节点  加载指令、gps、以及marker打点
				const vm =this;
				vm.carIds = [];
				vm.carIdOrder = [];
				let carIdArr = [];
				carIdArr.push(this.orderCarId);
				vm.carIdOrder.push(this.orderCarId);
				vm.$refs.tree2.setCheckedKeys(carIdArr);//选中节点
				vm.GPSdata =[];//gps的table数据设为空
				vm.directivedata =[];//指令table数据设为空
		    	//gps参数设置定时器
				if(vm.mapTimer){
					vm.mapTimer = clearInterval(vm.mapTimer); //去掉定时器的方法   同一个变量做定时器
				}
				let i = 1 ;
				vm.getGpsTable(carIdArr,"order");//GPS table信息 地图追随指令
				vm.mapTimer = setInterval(function(){
					console.log(vm.carFollow.validDate/vm.carFollow.timeInterval);
					console.log(i);
					//地图追随  位置跟随有效期内进行定时刷新
					if(vm.carFollow.validDate/vm.carFollow.timeInterval < i){
						Message.warning({message:"地图追随结束"});
						vm.mapTimer = clearInterval(vm.mapTimer); //去掉定时器的方法   同一个变量做定时器
						//vm.map.clearOverlays(); //清除marker
						return;
					}
					vm.$refs.tree2.setCheckedKeys(vm.carIdOrder);//选中节点
					vm.getGpsTable(carIdArr,"order");//GPS table信息 地图追随指令
					i++;
				},parseInt(vm.carFollow.timeInterval) * 1000);// 同一个变量做定时器
				vm.mapFollowVisible = false;
			},
			//节点被点击时的回调 三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身
			setMapZoom(data){
				const vm = this;
				//判断点击车辆是否选中
				if(vm.carIds.length == 0 || ($.inArray(data.carId,vm.carIds) == -1) || vm.mapForm.aggFlag == '1'){
					return;
				}else{
					//type:0：组织机构 1：车辆  	status:0：离线 1：在线 2：怠速 3：告警 4：未激活
					if(data.type == 1 && data.status != 4){
						let param = {};
						param.carIds = [];
						param.carIds.push(data.carId);
						//vm.$instance.get("/proxy/lbs/car/findGpsByCarIds", {params: param}).then(res =>{
						vm.$instance.post("/proxy/lbs/car/findGpsByCarIds", param).then(res =>{
				          	if(res.status == 200){
				          		if(res.data.length == 0){
				          			return;
								}
								let geoc = new BMap.Geocoder();//百度地图逆解析
								let markers = new Array();
								for(let obj of res.data){
									//84转百度
									var bd09 = utils.wgs84tobd09(obj.longitude, obj.latitude);
									obj.longitude = bd09[0];
									obj.latitude = bd09[1];
									let pt = new BMap.Point(obj.longitude , obj.latitude);
									vm.map.centerAndZoom(pt, 18);
								}
				            }else{
				                Message.warning({message:"没有获取到该车辆的经纬度"});
				            }
				        }).catch(error => {});
					}else{
						Message.warning({message: '请先选中在线的车辆'});
					}
				}

			},
			//查询指令
			refreshGps(){
				console.log(this.$refs.directiveTable.data);
				if(this.$refs.directiveTable.data.length > 0){
					let carId = this.$refs.directiveTable.data[0].carId;//车牌号ID
					if(carId){
						let carIds = [];
						carIds.push(carId);
						this.getDctTable(carIds);//获取指令信息
					}/*else{
						//Message.error({message: '未获取到车辆ID'});
					}*/
				}/*else{
					//Message.error({message: '未获取到车辆ID'});
				}*/
			},
			//点击文字下发
			orderText(){
					this.textDialogVisible = true;
			},
			// 关闭下发文本弹窗
			closeIssuedDialog(){
				//this.issuedTextCarList = [];
				this.textDialogVisible = false;
			},
			//点击全部
			allCheck(){
				const vm = this;
				//设置树的选中状态
				vm.liClass = 1;
				vm.carIdOrder = [];
				vm.carIds = [];
				vm.carIds = vm.allCarArr;
            	vm.$refs.tree2.setCheckedKeys(vm.allCarArr);
            	vm.initMapAndTable(vm.carIds, null, false);//地图添加车辆点、table信息
			},
			//点击在线
			onlineCheck(){
				const vm = this;
				vm.liClass = 2;
				//设置树的选中状态
				vm.carIdOrder = [];
				vm.carIds = [];
				vm.carIds = vm.onlineCarArr;
            	vm.$refs.tree2.setCheckedKeys(vm.onlineCarArr);
            	vm.initMapAndTable(vm.carIds, null, false);//地图添加车辆点、table信息
			},
			//点击离线
			offlineCheck(){
				const vm = this;
				vm.liClass = 3;
				//设置树的选中状态
				vm.carIdOrder = [];
				vm.carIds = [];
				vm.carIds = vm.offlineCarArr;
            	vm.$refs.tree2.setCheckedKeys(vm.offlineCarArr);
            	vm.initMapAndTable(vm.carIds, null, false);//地图添加车辆点、table信息
			},
			//点击未激活
			notActiveCheck(){
				this.liClass = 4;
				Message.warning({message:"未激活车辆暂无定位数据"});
			},

		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	@import "src/assets/css/mixin.scss";
	/*tbody tr:nth-child(odd){
    	background: #ffffff;
	}*/
	.liActive{
		background: $HeaderBackgroundColor !important;
	    color: #fff !important;
	}
	.liNotActive{
		background: #fff !important;
	    color: #373636 !important;
	}
	.home-con{
		background: none;
		.tree-box{
			width: 14%;
			background: #fff;
			// @at-root & {
		    //   	@media all and (max-width: 1400px)  {
			//       	& {
			//         	width: 20%;
			//       	}
			//     }
		    // }
			.carTypeCount{
				display: inline-block;
				width: 100%;
				background: #f2f2f2;
				
				li{
					display: inline-block;
					float: left;
					width: 25%;
					font-size: $fontSize12;
					text-align: center;
					padding: 3px 0;
					&:hover{
						@include cursor;
					}
					p{
						@include height(16px);
					}
				}
			}
		}
		.tree-list{
			margin-top: 10px;
			overflow: auto;
		}
		.map-box{
			width: 85.5%;
			background: #fff;
			/*overflow: hidden;
			overflow-x: hidden;
			overflow-y: scroll;*/
			position: relative;
			@at-root & {
		      	@media all and (max-width: 1400px)  {
			      	& {
			        	width: 79.5%;
			      	}
			    }
		    }
			.el-row{
				position: absolute;
				@include size(96%, 40px);
				top: 15px;
				left: 2%;
				ul{
					background: #fff;
					display: inline-block;
					-webkit-border-radius: 0 0 3px 3px;
				    -moz-border-radius:  0 0 3px 3px;
				    border-radius:  0 0 3px 3px;
				    /*border-bottom: 1px solid #dcdcdc;*/
				}
				.left-show{
					ul{
						padding: 5px 0;
						li{
							display: inline-block;
							float: left;
							@include height(30px);
							padding: 0 10px;
							background: #fff;
							color: #373636;
							font-size: 14px;
							border-right: 1px solid #dcdcdc;
							span{
								margin-left: 10px;
							}
							&:nth-last-child(1){
								border-right: none;
							}
						}
					}
				} 
				.right-show{
					text-align: right;
					.el-button{
						padding: 13px 20px;
						border: none;
						float: left;
					}
					li{
						position: relative;
					}
					.el-badge{
						position: absolute;
						vertical-align: top;
						right: -1px;
						.el-badge__content.is-fixed{
						    top: 3px;
    						right: 14px;
						}
						.el-button{
							padding: 13px 20px;
						}
					}
					em{
						display: inline-block;
						@include size(1px, 30px);
						background: #dcdcdc;
						float: left;
						margin-top: 5px;
					}
				}
			}
			/*警告框*/
			.alarm-box{
				position: absolute;
				width: 500px;
				background: #fff;
				top: 55px;
				right: 2%;
				@include borderRadius;
				padding: 0 8px;
				box-shadow: 0 0 4px 0px #9d9d9d;
				.alarm-title{
					ul{
						display: inline-block;
						width: 100%;
						padding: 8px;
						font-size: 14px;
						border-bottom: 1px solid #dcdcdc;
						i{
							color: red;
							cursor: pointer;
						}
					}
				}
				.alarm-lists{
					width: 100%;
					/*max-height: 265px;*/
					overflow-y: auto;
					ul{
						display: inline-block;
						width: 100%;
						padding: 5px 0;
						border-bottom: 1px solid #dcdcdc;
						li{
							display: inline-block;
							float: left;
							font-size: 14px;
							padding: 0 3px;
							color: #4f4f4f;
						}
						li:nth-child(1){
							width: 90px;
							text-align: center;
						}
						li:nth-child(2){
							width: 220px;
							span{
								color: red;
							}
						}
						li:nth-child(3){
							width: 70px;
							text-align: center;
							color: #409EFF;
							cursor: pointer;
						}
						li:nth-child(4){
							width: 87px;
							text-align: center;
							color: #409EFF;
							cursor: pointer;
						}
					}
					div:last-child > ul{
						border: none;
					}
				}
				p{
					@include size(100%, 35px);
					@include height(35px);
					text-align: center;
					font-size: 14px;
					border-top: 1px solid #dcdcdc;
					span{
						cursor: pointer;
						&:hover{
							color: #409EFF;
						}
					}
				}
			}
			.info-box{
				position: absolute;
				bottom: 0;
				@include size(100%, 200px);
				background: #fff;
				.el-tabs__content{
					padding: 0;
				}
			}
		}
		/*设置弹框*/
		.setting{
			.el-dialog__body{
				padding: 0;
			}
			.el-tabs__nav-scroll, .el-tabs--border-card{
				border: none;
			}
			.el-tabs__nav{
				width: 100%;
			}
			.el-tabs--border-card > .el-tabs__header .el-tabs__item{
				background: #efefef;
				width: 50%;
				border: none;
				text-align: center;
				padding: 0;
				margin: 0;
			}
			.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active{
				background: #fff;
				color: #585858;
			}
			.el-input{
				width: 230px;
			}
			.el-radio{
				margin-right: 80px;
			}
			.el-tabs--border-card>.el-tabs__content{
				padding: 30px 0 30px 60px;
				height: 340px;
			}
			.dialog-footer{
				padding-left: 115px;
			}
			.alarm-param form{
				padding: 80px 0 120px 0;
			}
		}
	}
	.alarmMap{
      width: 100%;
      height: 360px;
      border: 1px solid gray;
      overflow:hidden;
    }

    /*//table切换按钮选中样式*/
    .tab-active{
		background: #03a678 !important;
		color: #fff !important;
	}
    /*//地图下面table列表*/
    .table-box1{
    	position:absolute;
    	bottom:0;
		width: 100%;
		min-height: 40px;
		background-color:#fff;
		ul{
			display: block;
			width: 100%;
			height: 40px;
		}
		//.tabBtn button{
		.tabButton{
			border-radius: 0;
			padding: 12px 45px;
			float: left;
			margin: 0;
			border-left: none;
			background: #f2f2f2;
		}
		li.fr{
			padding-right: 20px;
			button{
				padding: 13px;
				margin-top: 6px;
			}
		}
	}
	.gpsInterval1{
		padding-top:5px;
		color:#85b3e0;
		border-top:1px solid #F5F5F5;
		text-align:center;
		font-size: 13px;
	}
	.myTab {
		height: 440px;
		.el-tabs__content{
			height: 460px !important;
		}
	}
	.tabBig{
		background: url(../../assets/img/tabBig.png) no-repeat;
		border: none;
	}
	.tabSmall{
		background: url(../../assets/img/tabSmall.png) no-repeat;
		border: none;
	}
</style>