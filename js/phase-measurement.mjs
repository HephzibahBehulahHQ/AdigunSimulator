const blocked=message=>({state:"blocked",engine:"Bounded two-channel ideal sine phase measurement",message,result:null});
const wrapPhase=degrees=>((degrees+180)%360+360)%360-180;
export function measureTwoChannelPhase(project){
  const scope=project?.phaseScope,a=scope?.channelA,b=scope?.channelB;
  if(!a||!b)return blocked("Configure two sine channels before measuring phase.");
  const fields=[a.frequencyHz,a.amplitudeV,a.offsetV,a.phaseDeg,b.frequencyHz,b.amplitudeV,b.offsetV,b.phaseDeg,scope.timeRangeCycles,scope.sampleCount];
  if(!fields.every(value=>Number.isFinite(Number(value)))||Number(a.frequencyHz)<=0||Number(b.frequencyHz)<=0||Number(a.amplitudeV)<0||Number(b.amplitudeV)<0||Number(scope.timeRangeCycles)<=0||!Number.isInteger(Number(scope.sampleCount))||scope.sampleCount<2||scope.sampleCount>2001)return blocked("Channel, timebase and sample settings are outside the supported range.");
  const fA=Number(a.frequencyHz),fB=Number(b.frequencyHz),relativeError=Math.abs(fA-fB)/Math.max(fA,fB);
  if(relativeError>1e-6)return blocked("Stable phase measurement requires matched channel frequencies within 1 ppm.");
  const phase=wrapPhase(Number(b.phaseDeg)-Number(a.phaseDeg)),frequency=(fA+fB)/2,periodS=1/frequency,timeRangeS=periodS*Number(scope.timeRangeCycles),count=Number(scope.sampleCount);
  const samples=Array.from({length:count},(_,i)=>{const timeS=timeRangeS*i/(count-1);return {timeS,channelAV:Number(a.offsetV)+Number(a.amplitudeV)*Math.sin(2*Math.PI*fA*timeS+Number(a.phaseDeg)*Math.PI/180),channelBV:Number(b.offsetV)+Number(b.amplitudeV)*Math.sin(2*Math.PI*fB*timeS+Number(b.phaseDeg)*Math.PI/180)};});
  return {state:"complete",engine:"Bounded two-channel ideal sine phase measurement",message:"Phase offset is calculated from declared source phases; it is not inferred from noisy sampled hardware traces.",result:{kind:"two-channel-phase",phaseOffsetDeg:phase,unit:"deg",channelBLeadsChannelA:phase>0,frequencyHz:frequency,relativeFrequencyErrorPpm:relativeError*1e6,periodS,timeRangeS,timeRangeCycles:Number(scope.timeRangeCycles),sampleCount:samples.length,samples}};
}
