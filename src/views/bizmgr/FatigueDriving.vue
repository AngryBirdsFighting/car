/**
 * @Author:      qinbb
 * @DateTime:    2018-03-20 14:35:07
 * @Description: 疲劳驾驶、超速、怠速、围栏设置组件
 */
<template>
	<div>
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="规则名称">
					<el-input  v-model="listQuery.ruleName" placeholder="请输入规则名称" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button 
					class="filter-item btnColor" 
					type="primary" 
					icon="el-icon-search"
					 @click.native.prevent="initTable">查询</el-button>
					<el-button 
					v-if="permBtn.rules_sets_add" 
					class="filter-item btnColor" 
					type="primary"  
					icon="el-icon-plus"
					@click.native.prevent="addFormOpen">新增</el-button>
				</el-form-item>
				<el-form-item>
					<span>规则使用说明：1.添加规则  2.设定自定义的规则条件  3.并把需要执行此规则的车辆授权给它</span>
				</el-form-item>
			</el-form>
		</div>
		<!-- 表格 -->
		<el-table ref="fatigueTable" :data="list" :height="tableHeight"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='规则名称' prop="ruleName"></el-table-column>
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button v-if="permBtn.rules_sets_config" class="btn rules" size="small" @click.native.prevent="setRule(scope.$index, scope.row)" title="设置规则"></el-button>
					<el-button v-if="permBtn.rules_sets_check" class="btn check" size="small" @click.native.prevent="checkInfo(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.rules_sets_modify" class="btn update" size="small" @click.native.prevent="updates(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.rules_sets_delete" class="btn delete" size="small" @click.native.prevent="deletes(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!--新增弹框-->
		<el-dialog :title="titles" :visible.sync="addFormVisible" :before-close="handleClose" :close-on-click-modal="false"
			:close-on-press-escape="false" top="10%" lock-scroll width="900px">
			<el-form class="small-space" ref="addForm" :rules="rulesAdd" :model="addRuleData" label-position="left" label-width="130px"
					v-loading="addLoad" element-loading-text="拼命加载中">
				<div class="grid-content bg-purple">
					<el-row>
					  	<el-col :span="10">
					  		<el-form-item label="规则名称：" prop="ruleName">
								<el-input v-model="addRuleData.ruleName" placeholder="请输入规则名称" :maxlength="30"></el-input>
							</el-form-item>
					  	</el-col>
					  	<el-col :span="14" v-if=" ruleTypes == '1' ">
					  		<el-form-item label="单次怠速时长超过：" prop="idlingLimit" class="ownLable">
								<el-input v-model="addRuleData.idlingLimit" placeholder="请输入单次怠速时长超过"></el-input>&nbsp;&nbsp;秒
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-row>
						<el-col :span="13">
							<el-form-item v-if=" ruleTypes == '2' " label="连续驾驶时间：" prop="drivingDuration">
								<el-input v-model="addRuleData.drivingDuration" placeholder="请输入连续驾驶时间"></el-input>&nbsp;&nbsp;分钟
							</el-form-item>
							<el-form-item v-if=" ruleTypes == '4' " label="最高速度：" prop="speedLimit">
								<el-input v-model="addRuleData.speedLimit" placeholder="请输入最高速度"></el-input>&nbsp;&nbsp;公里/时（0表示无限制）
							</el-form-item>
					  	</el-col>
					  	<el-col :span="11">
					  		<el-form-item v-if=" ruleTypes == '2' " label="最小休息时间：" prop="restDuration">
								<el-input v-model="addRuleData.restDuration" placeholder="请输入最小休息时间"></el-input>&nbsp;&nbsp;分钟
							</el-form-item>
							<el-form-item v-if=" ruleTypes == '4' " label="超速持续时间" prop="speedDuration">
								<el-input v-model="addRuleData.speedDuration" placeholder="请输入超速持续时间"></el-input>&nbsp;&nbsp;秒
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-form-item label="语音播报：" prop="alarmText">
						<el-input type="textarea" v-model="addRuleData.alarmText" :autosize="{minRows: 3, maxRows: 3}" placeholder="请输入语音播报内容"></el-input>
					</el-form-item>
					<h3 style="margin-bottom: 15px;">拍照和录像</h3>
					<el-form-item label="是否拍照：" prop="photoFlag">
					    <el-radio-group v-model="addRuleData.photoFlag" @change.native.prevent="changePhoto('addForm')" >
					      <el-radio :label="1">是</el-radio>
					      <el-radio :label="0">否</el-radio>
					    </el-radio-group>
				    </el-form-item>
				    <el-form-item label="拍照摄像头：" prop="photoChannels">
					    <el-checkbox :disabled = "photoChannels.disableds"
					    :indeterminate="photoChannels.isIndeterminate" 
					    v-model="photoChannels.checkAll" 
					    @change="checkAllPhoto"
					    ref="addPhoto">全选</el-checkbox>
					    <el-checkbox-group 
					    :disabled = "photoChannels.disableds"
					    v-model="addRuleData.photoChannels"  
					    @change="checkedPhotoChange"> 
					      <el-checkbox v-for="photo in photoOptions" :label="photo" :key="photo">{{photo}}号</el-checkbox>
					    </el-checkbox-group>
					</el-form-item>
					<el-form-item label="是否录像：" prop="cameraFlag">
					    <el-radio-group v-model="addRuleData.cameraFlag" @change.native.prevent="changeCamera('addForm')">
					      <el-radio :label="1">是</el-radio>
					      <el-radio :label="0">否</el-radio>
					    </el-radio-group>
				    </el-form-item>
				    <el-form-item label="录像时长：" prop="cameraDuration">
						<el-input :disabled = "cameraChannels.disableds" v-model="addRuleData.cameraDuration" placeholder="请输入整数"></el-input>&nbsp;&nbsp;秒
					</el-form-item>
				    <el-form-item label="录像摄像头："  prop="cameraChannels">
					    <el-checkbox :disabled = "cameraChannels.disableds" :indeterminate="cameraChannels.isIndeterminate" v-model="cameraChannels.checkAll" @change="checkAllCamera">全选</el-checkbox>
					    <el-checkbox-group :disabled = "cameraChannels.disableds" v-model="addRuleData.cameraChannels"  @change="checkedCameraChange"> 
					      <el-checkbox v-for="camera in cameraOptions" :label="camera" :key="camera">{{camera}}号</el-checkbox>
					    </el-checkbox-group>
					</el-form-item>
				</div>
				<el-form-item class="formButton">
					<el-button @click.native.prevent="canelForm('addForm')">取 消</el-button>
					<el-button type="primary" @click.native.prevent="addRuleForm('addForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 修改 -->
		<el-dialog :title="titles" :visible.sync="updateFormVisible" :before-close="handleClose" top="10%" :close-on-click-modal="false"
			:close-on-press-escape="false" lock-scroll width="900px">
			<el-form class="small-space" ref="updateForm" :rules="rulesAdd" :model="updateRuleData" label-position="left" label-width="130px"
					v-loading="updateLoad" element-loading-text="拼命加载中">
				<div class="grid-content bg-purple">
					<el-row>
					  	<el-col :span="10">
					  		<el-form-item label="规则名称：" prop="ruleName">
								<el-input v-model="updateRuleData.ruleName" placeholder="请输入规则名称" :maxlength="30"></el-input>
							</el-form-item>
					  	</el-col>
					  	<el-col :span="14" v-if=" ruleTypes == '1' ">
					  		<el-form-item label="单次怠速时长超过：" prop="idlingLimit" class="ownLable">
								<el-input v-model="updateRuleData.idlingLimit" placeholder="请输入单次怠速时长超过"></el-input>&nbsp;&nbsp;秒
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-row>
						<el-col :span="13">
							<el-form-item v-if=" ruleTypes == '2' " label="连续驾驶时间：" prop="drivingDuration">
								<el-input v-model="updateRuleData.drivingDuration" placeholder="请输入连续驾驶时间"></el-input>&nbsp;&nbsp;分钟
							</el-form-item>
							<el-form-item v-if=" ruleTypes == '4' " label="最高速度：" prop="speedLimit">
								<el-input v-model="updateRuleData.speedLimit" placeholder="请输入最高速度"></el-input>&nbsp;&nbsp;公里/时（0表示无限制）
							</el-form-item>
					  	</el-col>
					  	<el-col :span="11">
					  		<el-form-item v-if=" ruleTypes == '2' " label="最小休息时间：" prop="restDuration">
								<el-input v-model="updateRuleData.restDuration" placeholder="请输入最小休息时间"></el-input>&nbsp;&nbsp;分钟
							</el-form-item>
							<el-form-item v-if=" ruleTypes == '4' " label="超速持续时间" prop="speedDuration">
								<el-input v-model="updateRuleData.speedDuration" placeholder="请输入超速持续时间"></el-input>&nbsp;&nbsp;秒
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-form-item label="语音播报：" prop="alarmText">
						<el-input type="textarea" v-model="updateRuleData.alarmText" :autosize="{minRows: 3, maxRows: 3}" placeholder="请输入语音播报内容"></el-input>
					</el-form-item>
					<h3 style="margin-bottom: 15px;">拍照和录像</h3>
					<el-form-item label="是否拍照：" prop="photoFlag">
					    <el-radio-group v-model="updateRuleData.photoFlag" @change.native.prevent="changePhoto('updateForm')" >
					      <el-radio :label="1">是</el-radio>
					      <el-radio :label="0">否</el-radio>
					    </el-radio-group>
				    </el-form-item>
				    <el-form-item label="拍照摄像头：" prop="photoChannels">
					    <el-checkbox :disabled = "photoChannels1.disableds"
						    :indeterminate="photoChannels1.isIndeterminate" 
						    v-model="photoChannels1.checkAll" 
						    @change="checkAllPhoto1">全选
					    </el-checkbox>
					    <el-checkbox-group 
					    :disabled = "photoChannels1.disableds"
					    v-model="updatephotoChannels"  
					    @change="checkedPhotoChange1"> 
					      <el-checkbox v-for="photo in photoOptions" :label="photo" :key="photo">{{photo}}号</el-checkbox>
					    </el-checkbox-group>
					</el-form-item>
					<el-form-item label="是否录像：" prop="cameraFlag">
					    <el-radio-group v-model="updateRuleData.cameraFlag" @change.native.prevent="changeCamera('updateForm')">
					      <el-radio :label="1">是</el-radio>
					      <el-radio :label="0">否</el-radio>
					    </el-radio-group>
				    </el-form-item>
				    <el-form-item label="录像时长：" prop="cameraDuration">
						<el-input :disabled = "cameraChannels1.disableds" v-model="updateRuleData.cameraDuration" placeholder="请输入整数"></el-input>&nbsp;&nbsp;秒
					</el-form-item>
				    <el-form-item label="录像摄像头："  prop="cameraChannels">
					    <el-checkbox 
					    :disabled = "cameraChannels1.disableds" 
					    :indeterminate="cameraChannels1.isIndeterminate" 
					    v-model="cameraChannels1.checkAll" 
					    @change="checkAllCamera1">全选</el-checkbox>
					    <el-checkbox-group 
					    :disabled = "cameraChannels1.disableds" 
					    v-model="updateCameraChanels"  
					    @change="checkedCameraChange1"> 
					      <el-checkbox v-for="camera in cameraOptions" :label="camera" :key="camera">{{camera}}号</el-checkbox>
					    </el-checkbox-group>
					</el-form-item>
				</div>
				<el-form-item class="formButton">
					<el-button @click.native.prevent="canelForm('addForm')">取 消</el-button>
					<el-button type="primary" @click.native.prevent="addRuleForm('updateForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 查看 -->
		<el-dialog :title="titles" class="check-dialog fatigue-check" :visible.sync="checkFormVisible" top="10%" lock-scroll 
			width="900px" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="checkForm" :model="updateRuleData" label-position="left" label-width="140px">
				<div class="grid-content bg-purple">
					<el-row>
						<el-col :span="9">
					  		<el-form-item label="规则名称：">
								<el-tooltip class="item" effect="dark" :content="updateRuleData.ruleName" placement="top-start">
							      	<strong class="strongTip">{{updateRuleData.ruleName}}</strong>
							    </el-tooltip>
							</el-form-item>
					  	</el-col>
						<el-col :span="8">
					  		<div v-if=" ruleTypes == '2' ">
					  			<el-form-item label="连续驾驶时间：">
									<strong>{{updateRuleData.drivingDuration}}</strong>分钟
								</el-form-item>
					  		</div>
					  		<div v-if=" ruleTypes == '4' ">
					  			<el-form-item label="最高速度：">
									<strong>{{updateRuleData.speedLimit}}</strong>km/h
								</el-form-item>
					  		</div>
					  		<div v-if=" ruleTypes == '1' ">
					  			<el-form-item label="单次怠速时长超过：">
									<strong>{{updateRuleData.idlingLimit}}</strong>秒
								</el-form-item>
					  		</div>
					  	</el-col>
					  	<el-col :span="7">
					  		<div v-if=" ruleTypes == '2' ">
					  			<el-form-item label="最小休息时间：">
									<strong>{{updateRuleData.restDuration}}</strong>分钟
								</el-form-item>
					  		</div>
					  		<div v-if=" ruleTypes == '4' ">
					  			<el-form-item label="超速持续时间：">
									<strong>{{updateRuleData.speedDuration}}</strong>秒
								</el-form-item>
					  		</div>
					  	</el-col>
					</el-row>
					<el-form-item label="语音播报：">
						<strong class="strongTipWrapNoScoll">{{updateRuleData.alarmText}}</strong>
					</el-form-item>
					<h3 style="margin-bottom: 15px;">拍照和录像</h3>
					<el-row>
						<el-col :span="5">
					  		<el-form-item label="是否拍照：">
					  			<strong v-if="updateRuleData.photoFlag == 1">是</strong>
					      		<strong v-else>否</strong>
					  		</el-form-item>
					  	</el-col>
						<el-col :span="19" v-show="updateRuleData.photoFlag == 1">
					  		<el-form-item label="拍照摄像头：">
					    		<strong v-for="photo in updatephotoChannels" :key="photo">
					    			{{photo}}号&nbsp;&nbsp;&nbsp;&nbsp;
					    		</strong>
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-row>
						<el-col :span="5">
					  		<el-form-item label="是否录像：">
					  			<strong v-if="updateRuleData.cameraFlag == 1">是</strong>
					    		<strong v-else>否</strong>
					  		</el-form-item>
					  	</el-col>
						<el-col :span="19" v-show="updateRuleData.cameraFlag == 1">
					  		<el-form-item label="拍照摄像头：">
					    		<strong v-for="photo in updateCameraChanels" :key="photo">
					    			{{photo}}号&nbsp;&nbsp;&nbsp;&nbsp;
					    		</strong>
							</el-form-item>
					  	</el-col>
					</el-row>
					<el-row>
					  	<el-col :span="24" v-show="updateRuleData.cameraFlag == 1">
					  		<el-form-item label="录像时长：">
					  			<strong>{{updateRuleData.cameraDuration}}</strong>秒
					  		</el-form-item>
					  	</el-col>
					</el-row>
				</div>
			</el-form>
		</el-dialog>
		
		<!-- 规则设置 查询规则车辆 -->
		<rule-set-dialog ref="ruleSetChild" :rulesData="rulesData" :ruleIs2or4="ruleTypes == '2'|| ruleTypes == '4'" @changeRule="changeRules($event)"></rule-set-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import {api} from 'src/global/api';
	import { utils } from 'src/utils';
	import { validate } from 'utils/validate';
	import { Message } from 'element-ui';
	import RuleSetDialog from '../../components/RuleSetDialog';//分配规则组件

	const photoOption = ['1','2','3','4','5','6','7','8'];//拍照
	const cameraOption = ['1','2','3','4','5','6','7','8'];//录像
	export default {
		name: 'FatigueDriving',
		components: { 
			'rule-set-dialog':RuleSetDialog//分配规则组件
		 },
	    // 声明 props
	    props: ['ruleTypes'],//1怠速时长 2 疲劳驾驶 3电子围栏 4超速
		data() {
			const vm = this;
			//新增校验 拍照（为关闭） 拍照摄像头不做校验
			const validatePhoto = (rule, value, callback) => {
				let flag = 1;
				if(vm.titles == "新增"){
					flag = vm.addRuleData.photoFlag;
				}else if (vm.titles == "修改"){
					flag = vm.updateRuleData.photoFlag;
					value = vm.updatephotoChannels;
				}
				if(flag == 1){
					if (value) {
						if(value.length != undefined && value.length == 0){
							callback(new Error('请至少选择一个拍照通道'));
						}else {
				          	callback();
				        }
			        }else {
			          	callback(new Error('请至少选择一个拍照通道'));
			        }
				}else{
					callback();
				}
		    };
		    //新增校验 录像（为关闭） 录像摄像头不做校验
		    const validateCamera = (rule, value, callback) => {
		    	let flag = 1;
				if(vm.titles == "新增"){
					flag = vm.addRuleData.cameraFlag;
				}else if (vm.titles == "修改"){
					flag = vm.updateRuleData.cameraFlag;
					value = vm.updateCameraChanels;
				}
	    		if(flag == 1){
					if (value) {
						if(value.length != undefined && value.length == 0){
							callback(new Error('请至少选择一个摄像通道'));
						}else {
				          	callback();
				        }
			        }else {
			          	callback(new Error('请至少选择一个摄像通道'));
			        }
				}else{
					callback();
				}
		    };
		    //新增校验 录像（为关闭） 录像时长不做校验
		    const validateCameraTime = (rule, value, callback) => {
				let flag = 1;
				if(vm.titles == "新增"){
					flag = vm.addRuleData.cameraFlag;
				}else if (vm.titles == "修改"){
					flag = vm.updateRuleData.cameraFlag;
				}
	    		if(flag == 1 && !value){
		          	callback(new Error('请输入正整数'));
				}else{
					callback();
				}
		    };
	     	return {
	     		permBtn:{
					rules_sets_add:false,//新增
					rules_sets_modify:false,//修改
					rules_sets_delete:false,//删除
					rules_sets_check:false,//查看
					rules_sets_config:false//分配规则
	     		},
	     		//分配规则数据
	     		rulesData:{
	     			ruleId: '',//规则ID
	     			name: '',//规则名称
					dialog: false,//弹框是否显示
					type: 1//1：规则设定 分配规则  2：围栏设置 分配规则
	     		},
	     		photoOptions: photoOption,//照相通道
	     		cameraOptions: cameraOption,//摄像通道
	     		listQuery:{
					ruleName: '',//规则名称
					ruleType: ''//规则类型
	     		},
				listLoading: false,//table加载中
				height: 670,
				list: [],//table列表
				addFormVisible: false,//新增弹框
				updateFormVisible: false,//修改弹框
				checkFormVisible: false,//新增弹框
				//新增规则
				addRuleData:{
					alarmText: '',//报警语音文本
					cameraChannels: [],//摄像通道	 通道号从1到8
					cameraDuration: null,//摄像时间	 秒
					cameraFlag: 1,//摄像开关	1：开 0：关
					photoChannels: [],//拍照通道		通道号从1到8
					photoFlag: 1,//拍照开关	1：开 0：关
					ruleName: '',//规则名称	
					ruleType: '',//规则类型	 1怠速时长 2 疲劳驾驶 3电子围栏 4超速	
					//规则数据
					idlingLimit: null,//怠速时间秒
					drivingDuration: null,//持续驾驶时间 分钟
					restDuration: null,//最小休息时间 分钟
					speedLimit: null,//最高速度 km/h 2位小数
					speedDuration: null//超速持续时间 秒
				},
				//修改规则
				updateRuleData:{
					ruleId: '',//规则ID
					alarmText: '',//报警语音文本
					cameraChannels: [],//摄像通道	 通道号从1到8
					cameraDuration: null,//摄像时间	 秒
					cameraFlag: 1,//摄像开关	1：开 0：关
					photoChannels: [],//拍照通道		通道号从1到8
					photoFlag: 1,//拍照开关	1：开 0：关
					ruleName: '',//规则名称	
					//规则数据
					idlingLimit: null,//怠速时间秒
					drivingDuration: null,//持续驾驶时间 分钟
					restDuration: null,//最小休息时间 分钟
					speedLimit: null,//最高速度 km/h 2位小数
					speedDuration: null//超速持续时间 秒
				},
				updateCameraChanels: [],//修改的摄像通道
				updatephotoChannels: [],//修改拍照通道
				//新增拍照摄像头全选设置
				photoChannels: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				//新增录像摄像头全选设置
				cameraChannels: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				//修改拍照摄像头全选设置
				photoChannels1: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				//修改录像摄像头全选设置
				cameraChannels1: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				titles:'',//弹框title
				//新增校验
				rulesAdd:{
					alarmText: [
						{ required: true, message: '请输入报警语音文本', trigger: 'blur' }
					],
					cameraChannels: [
						{ type: 'array', required: true, trigger: 'change', validator: validateCamera}
					],
					cameraDuration: [
						{ required: true, trigger: 'blur', validator: validateCameraTime}
					],
					photoChannels: [
						{ type: 'array', required: true, trigger: 'change', validator: validatePhoto}
					],
					ruleName: [
						{ required: true, message: '请输入规则名称', trigger: 'blur' }
					],
					drivingDuration: [
						 { required: true, trigger: 'blur' , validator: validate.validateNumber},//整数不为空
					],
					restDuration: [
						 { required: true, trigger: 'blur' , validator: validate.validateNumber},
					],
					speedLimit: [
						 { required: true, trigger: 'blur' , validator: validate.validateNumber},
					],
					speedDuration: [
						 { required: true, trigger: 'blur' , validator: validate.validateNumber},
					],
					idlingLimit: [
						 { required: true, trigger: 'blur' , validator: validate.validateNumber},
					]
				},
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
	      	};
	    },
	    mounted() {
			this.getPerm();//权限
			this.initTable();//表格
	    },
	    //计算属性
		computed:{
			// 计算属性的 getter
		    tableHeight: function () {
		      // `this` 指向 vm 实例
		      let heights = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;//浏览器高度
		      this.height = (heights - 230);
		      return this.height;//table高度固定
		    }
		},
		watch: {

		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取表格数据
			initTable(){
				var vm = this;
				vm.listLoading = true;
				vm.listQuery.ruleType = vm.ruleTypes;//1怠速时长 2 疲劳驾驶 3电子围栏 4超速
				let params = JSON.parse(JSON.stringify(vm.listQuery));
				vm.$instance.post('/proxy/bizmgr/rule/findRuleList', params).then(res =>{
					vm.listLoading = false;
		          	if(res.status == 200){
		              	vm.list = res.data;
		              	resolve();//异步操作成功
		          	}else{
		             	Message.error(res.data.errorMsg);
		          	}
		        }).catch(error => {
		        	vm.listLoading = false;
		        });

			},
			//新增打开弹框
			addFormOpen(){
				this.addFormVisible = true;
				if(this.titles && this.$refs.addForm){
					this.$refs.addForm.clearValidate();//移除校验结果
				}
				this.titles = "新增";
			},
			//弹框关闭
			handleClose(done){
				let vm = this;
				let param = "";
				if(vm.titles == "新增"){
					vm.addRuleData.alarmText = '';
					vm.addRuleData.cameraChannels = [];
					vm.addRuleData.cameraDuration = null;
					vm.addRuleData.cameraFlag = 1;
					vm.addRuleData.photoChannels = [];
					vm.addRuleData.photoFlag = 1;
					vm.addRuleData.ruleName = '';
					vm.addRuleData.ruleType = '';
					vm.addRuleData.idlingLimit = null;
					vm.addRuleData.drivingDuration = null;
					vm.addRuleData.restDuration = null;
					vm.addRuleData.speedLimit = null;
					vm.addRuleData.speedDuration = null;

					vm.photoChannels.checkAll = false;
					vm.photoChannels.isIndeterminate = false;
					vm.photoChannels.disableds = false;
					vm.cameraChannels.checkAll = false;
					vm.cameraChannels.isIndeterminate = false;
					vm.cameraChannels.disableds = false;

					param = "addForm";
				}else if(vm.titles == "修改"){
					vm.updateRuleData.alarmText = '';
					vm.updateRuleData.cameraChannels = [];
					vm.updateCameraChanels  = [];
					vm.updateRuleData.cameraDuration = null;
					vm.updateRuleData.cameraFlag = 1;
					vm.updateRuleData.photoChannels = [];
					vm.updatephotoChannels = [];
					vm.updateRuleData.photoFlag = 1;
					vm.updateRuleData.ruleName = '';
					vm.updateRuleData.ruleType = '';
					vm.updateRuleData.idlingLimit = null;
					vm.updateRuleData.drivingDuration = null;
					vm.updateRuleData.restDuration = null;
					vm.updateRuleData.speedLimit = null;
					vm.updateRuleData.speedDuration = null;
					param = "updateForm";
				}
				vm.changePhoto(param,'notValide');
				vm.changeCamera(param,'notValide');
				if (this.$refs[param]) {
					this.$refs[param].clearValidate();//移除校验结果
				}
				
				if(!done){
					return ;
				}
				done(); 
			},
			//设置规则
			setRule(index,row){
				this.rulesData.name = row.ruleName;//规则名称
				this.rulesData.ruleId = row.ruleId;//规则ID
				this.rulesData.dialog = true;//弹框显示
			},
			//是否拍照 1：开 0：关
			changePhoto(par,para){
				let formRef = "";
				if(par == "addForm"){
					if(this.addRuleData.photoFlag == 1){
						this.photoChannels.disableds = false;//通道可选择
					}else if(this.addRuleData.photoFlag == 0){
						this.photoChannels.disableds = true;//通道不可选择
					}
					formRef = "addForm";
				}else if(par == "updateForm"){
					if(this.updateRuleData.photoFlag == 1){
						this.photoChannels1.disableds = false;//通道可选择
					}else if(this.updateRuleData.photoFlag == 0){
						this.photoChannels1.disableds = true;//通道不可选择
					}
					formRef = "updateForm";
				}
				if(!para){
					this.$refs[formRef].validateField('photoChannels');//单独校验
				}
			},
			//是否录像 1：开 0：关
			changeCamera(par,para){
				let formRef = "";
				if(par == "addForm"){
					if(this.addRuleData.cameraFlag == 1){
						this.cameraChannels.disableds = false;//通道不可选择
					}else if(this.addRuleData.cameraFlag == 0){
						this.cameraChannels.disableds = true;//通道可选择
					}
					formRef = "addForm";
				}else if(par == "updateForm"){
					if(this.updateRuleData.cameraFlag == 1){
						this.cameraChannels1.disableds = false;//通道不可选择
					}else if(this.updateRuleData.cameraFlag == 0){
						this.cameraChannels1.disableds = true;//通道可选择
						
					}
					formRef = "updateForm";
				}
				if(!para){
					this.$refs[formRef].validateField('cameraDuration');
					this.$refs[formRef].validateField('cameraChannels');
				}
			},
			//新增拍照全选
			checkAllPhoto(val) {
		        this.addRuleData.photoChannels = val ? photoOption : [];
		        this.photoChannels.isIndeterminate = false;
		    },
		    //新增拍照反选
		    checkedPhotoChange(value) {
		        let checkedCount  = value.length;
		        this.photoChannels.checkAll = checkedCount === this.photoOptions.length;
		        this.photoChannels.isIndeterminate = checkedCount > 0 && checkedCount < this.photoOptions.length;
		    },
		    //新增录像全选
			checkAllCamera(val) {
		        this.addRuleData.cameraChannels = val ? cameraOption : [];
		        this.cameraChannels.isIndeterminate = false;
		    },
		    //新增录像反选
		    checkedCameraChange(value) {
		        let checkedCount  = value.length;
		        this.cameraChannels.checkAll = checkedCount === this.cameraOptions.length;
		        this.cameraChannels.isIndeterminate = checkedCount > 0 && checkedCount < this.cameraOptions.length;
		    },
		    //修改拍照全选
			checkAllPhoto1(val) {
		        this.updatephotoChannels = val ? photoOption : [];
		        this.photoChannels1.isIndeterminate = false;
		    },
		    //修改拍照反选
		    checkedPhotoChange1(value) {
		        let checkedCount  = value.length;
		        this.photoChannels1.checkAll = checkedCount === this.photoOptions.length;
		        this.photoChannels1.isIndeterminate = checkedCount > 0 && checkedCount < this.photoOptions.length;
		    },
		    //修改录像全选
			checkAllCamera1(val) {
		        this.updateCameraChanels = val ? cameraOption : [];
		        this.cameraChannels1.isIndeterminate = false;
		    },
		    //修改录像反选
		    checkedCameraChange1(value) {
	    		let checkedCount  = value.length;
		        this.cameraChannels1.checkAll = checkedCount === this.cameraOptions.length;
		        this.cameraChannels1.isIndeterminate = checkedCount > 0 && checkedCount < this.cameraOptions.length;
		    },
      		//取消
      		canelForm(formName){
      			this.addFormVisible = false;//新增弹框关闭
      			this.updateFormVisible = false;//修改弹框关闭
				this.handleClose();
      		},
			//提交
			addRuleForm(param){
				const vm = this;
				validate.isValidate(vm, param, (formData)=>{
					if(formData.validates){
						vm.addRules(param);//调用后台接口
					}
				});
			},
			//新增
			addRules(par){
				const vm = this;
				let params = {};
				let url = "";
      			let msg = "";
				if(vm.ruleTypes){
					if(par == 'updateForm'){
						vm.updateFormVisible = true;
						vm.updateLoad = true;
						vm.updateRuleData
						url = "/proxy/bizmgr/rule/modifyRule";
						msg = "规则修改成功！";
						params = JSON.parse(JSON.stringify(vm.updateRuleData));//不会改变原始数据
						params.ruleData ={};
						if(vm.ruleTypes == "1"){
							params.ruleData.idlingLimit = vm.updateRuleData.idlingLimit;//怠速时间秒
						}else if(vm.ruleTypes == "2"){
							params.ruleData.drivingDuration = vm.updateRuleData.drivingDuration;//持续驾驶时间 分钟
							params.ruleData.restDuration = vm.updateRuleData.restDuration;//最小休息时间 分钟
						}else if(vm.ruleTypes == "4"){
							params.ruleData.speedLimit = vm.updateRuleData.speedLimit;//最高速度 km/h 2位小数
							params.ruleData.speedDuration = vm.updateRuleData.speedDuration;//超速持续时间 秒
						}
						params.photoChannels = vm.updatephotoChannels;
						params.cameraChannels = vm.updateCameraChanels;
	      			}else if(par == 'addForm'){
	      				vm.addFormVisible = true;	
	      				vm.addLoad = true;
						url = "/proxy/bizmgr/rule/addRule";
						msg = "规则新增成功！";
						vm.addRuleData.ruleType = vm.ruleTypes;
						params = JSON.parse(JSON.stringify(vm.addRuleData));//不会改变原始数据
						params.ruleData ={};
						if(vm.ruleTypes == "1"){
							params.ruleData.idlingLimit = vm.addRuleData.idlingLimit;//怠速时间秒
						}else if(vm.ruleTypes == "2"){
							params.ruleData.drivingDuration = vm.addRuleData.drivingDuration;//持续驾驶时间 分钟
							params.ruleData.restDuration = vm.addRuleData.restDuration;//最小休息时间 分钟
						}else if(vm.ruleTypes == "4"){
							params.ruleData.speedLimit = vm.addRuleData.speedLimit;//最高速度 km/h 2位小数
							params.ruleData.speedDuration = vm.addRuleData.speedDuration;//超速持续时间 秒
						}
	      			}
				}
				if(params.photoFlag == 0){
					params.photoChannels = [];
					vm.updatephotoChannels = [];
				}
				if(params.cameraFlag == 0){
					params.cameraChannels = [];
					vm.updateCameraChanels = [];
					params.cameraDuration = null;
				}
				if(params.cameraChannel){
					delete params.cameraChannel;//删除属性
				}
				if(params.photoChannel){
					delete params.photoChannel;//删除属性
				}
				delete params.idlingLimit;//删除属性
				delete params.speedLimit;//删除属性
				delete params.speedDuration;//删除属性
				delete params.drivingDuration;//删除属性
				delete params.restDuration;//删除属性
				params.ruleData = JSON.stringify(params.ruleData);
				params.photoFlag = parseInt(params.photoFlag);
				params.cameraFlag = parseInt(params.cameraFlag);
      			vm.$instance.post(url, params).then(res =>{
					if(res.status == 200){
						if (res.data.success) {
							Message.success({message: msg});
							if(par == 'updateForm'){
								vm.updateLoad = false;
								vm.updateFormVisible = false;
								vm.updateRuleData = vm.updateRuleData;
							}else if(par == 'addForm'){
								vm.addLoad = false;
								vm.addFormVisible= false;
								vm.addRuleData = vm.addRuleData;
			      			}
			      			vm.handleClose();
							vm.initTable();
							resolve();//异步操作成功
						} else {
							vm.updateLoad = false;
							vm.addLoad = false;
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						vm.updateLoad = false;
						vm.addLoad = false;
						Message.error({message:"调用接口失败"});
					}
					vm.canelForm(par);
				}).catch(error => {
					vm.updateLoad = false;
					vm.addLoad = false;
				});
			},
			//查看
			checkInfo(index,row,par){
				if(row.ruleId){
					if(par == 'update'){
						this.updateFormVisible = true;
					}else{
						this.titles = "查看";
						this.checkFormVisible = true;
					}
				}else{
					return;
				}
				let params ={};
				params.ruleId = row.ruleId;
				params = JSON.parse(JSON.stringify(params));
				let vm =this;
				vm.$instance.get("/proxy/bizmgr/rule/findRuleInfo", {params: params}).then(res =>{
					if(res.status == 200){
						if(res.data){
							vm.updateRuleData = res.data;
							vm.updateRuleData.ruleId = row.ruleId;
							if(vm.ruleTypes == "1"){
								vm.updateRuleData.idlingLimit = res.data.ruleData.idlingLimit;//怠速时间秒
							}else if(vm.ruleTypes == "2"){
								vm.updateRuleData.drivingDuration = res.data.ruleData.drivingDuration;//持续驾驶时间 分钟
								vm.updateRuleData.restDuration = res.data.ruleData.restDuration;//最小休息时间 分钟
							}else if(vm.ruleTypes == "4"){
								vm.updateRuleData.speedLimit = res.data.ruleData.speedLimit;//最高速度 km/h 2位小数
								vm.updateRuleData.speedDuration = res.data.ruleData.speedDuration;//超速持续时间 秒
							}
							if(res.data.photoFlag == 0){
								vm.updatephotoChannels = [];
							}else{
								vm.updatephotoChannels = res.data.photoChannel;
							}
							if(res.data.cameraFlag == 0){
								vm.updateCameraChanels = [];
							}else{
								vm.updateCameraChanels  = res.data.cameraChannel;
							}
							if(par == 'update'){
								vm.changePhoto("updateForm",'notValide');
								vm.changeCamera("updateForm",'notValide');
								if(res.data.photoChannel && res.data.photoChannel.length == 8){
									vm.photoChannels1.checkAll = true;
									vm.photoChannels1.isIndeterminate = false;
								}else if (res.data.photoChannel && res.data.photoChannel.length == 0){
									vm.photoChannels1.checkAll = false;
									vm.photoChannels1.isIndeterminate = fasle;
								} else {
									vm.photoChannels1.checkAll = false;
									vm.photoChannels1.isIndeterminate = true;
								}
								if(res.data.cameraChannel &&  res.data.cameraChannel.length == 8){
									vm.cameraChannels1.checkAll = true;
									vm.cameraChannels1.isIndeterminate = false;
								}else if(res.data.cameraChannel &&  res.data.cameraChannel.length == 0){
									vm.cameraChannels1.checkAll = false;
									vm.cameraChannels1.isIndeterminate = false;
								}else{
									vm.cameraChannels1.checkAll = false;
									vm.cameraChannels1.isIndeterminate = true;
								}
							}
							if(vm.updateRuleData.cameraChannel){
								delete vm.updateRuleData.cameraChannel;//删除属性
							}
							if(vm.updateRuleData.photoChannel){
								delete vm.updateRuleData.photoChannel;//删除属性
							}
						}
						resolve();//异步操作成功
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					
				});
			},
			//修改
			updates(index,row){
				this.titles = "修改";
				this.checkInfo(index,row,'update');//查看
			},
			//删除
			deletes(index, row){
				let vm =this;
				this.$confirm('是否删除< '+ row.ruleName +' >规则！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let params = {};
					params.ruleId = row.ruleId;
					params = JSON.parse(JSON.stringify(params));
					vm.$instance.post("/proxy/bizmgr/rule/deleteRule", params).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								Message.success({message: '规则删除成功！'});
								vm.initTable();
								resolve();//异步操作成功
							} else {
								Message.error({message:res.data.errorMsg});
							}						
						}else{
							Message.error({message:"调用接口失败"});
						}
						vm.addFormVisible = false;	
					}).catch(error => {
						
					});
				}).catch(() => {
					Message.info({message: '已取消删除'});          
				});
			},
			//关闭设置规则弹框
		    changeRules(param){
		    	this.rulesData.dialog = param;
		    }

		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	.check-dialog .el-dialog__body{
		padding-bottom: 10px;
	}
	.fatigue-check{
		.el-checkbox-group{
			line-height: 30px;
		}
	}
	.ownLable .el-form-item__label{
		width: 150px !important;
	}
</style>
