const finite=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
export function runPwmFanController(project) {
  const cfg=project?.pwmFanController,curve=cfg?.curve,samples=cfg?.temperatureSamples;
  const validCurve=Array.isArray(curve)&&curve.length>=2&&curve.length<=12&&curve.every((point,index)=>finite(point?.tempC,-40,150)&&finite(point?.dutyPercent,0,100)&&(index===0||(point.tempC>curve[index-1].tempC&&point.dutyPercent>=curve[index-1].dutyPercent)));
  if(cfg?.kind!=="temperature-duty-curve"||!validCurve||!Array.isArray(samples)||samples.length<1||samples.length>300||samples.some(value=>!finite(value,-40,150)))
    return {state:"blocked",engine:"PWM fan temperature curve concept",message:"Provide 2–12 ordered temperature/duty knots and 1–300 temperatures in the supported ranges.",errors:[{code:"PWM_FAN_CONFIGURATION",message:"The curve must have increasing temperatures and nondecreasing 0–100% duty values."}],warnings:[],result:null};
  const dutyAt=tempC=>{if(tempC<=curve[0].tempC)return curve[0].dutyPercent;if(tempC>=curve.at(-1).tempC)return curve.at(-1).dutyPercent;const upper=curve.findIndex(point=>point.tempC>=tempC);const a=curve[upper-1],b=curve[upper];return a.dutyPercent+(tempC-a.tempC)*(b.dutyPercent-a.dutyPercent)/(b.tempC-a.tempC);};
  const frames=samples.map((tempC,index)=>({step:index+1,tempC,dutyPercent:Number(dutyAt(tempC).toFixed(4))}));
  return {state:"complete",engine:"Deterministic piecewise-linear PWM duty mapping",message:"PWM duty is linearly interpolated between configured knots and clamped to endpoint duties outside the curve.",errors:[],warnings:[{code:"PWM_FAN_CONCEPT_ONLY",message:"This is a setpoint-to-duty mapping only; no MCU firmware, timer quantization, driver electronics, fan startup, tachometer feedback, airflow, or thermal response is simulated."}],result:{kind:"pwm-fan-duty-curve",knotCount:curve.length,sampleCount:frames.length,frames}};
}
