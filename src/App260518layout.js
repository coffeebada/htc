import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Mic, Square, Download, Settings, X } from 'lucide-react';

// 🎨 글로벌 해상도 락 스타일시트 (디자인 원형 100% 보존)
const BOX_STYLE = {
  container: { backgroundColor: '#050a14', width: '1920px', height: '1080px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' },
  contentWrapper: { width: '1080px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  routeBtn: { padding: '10px 24px', borderRadius: '12px', border: '1px solid #374151', fontSize: '15px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.15s ease-in-out', display: 'flex', alignItems: 'center', gap: '6px' },
  selectBox: { background: '#1e293b', color: '#60a5fa', border: '2px solid #334155', borderRadius: '14px', padding: '8px 20px', fontSize: '20px', fontWeight: '900', outline: 'none', width: '160px' },
  micBtn: { padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' },
  settingsBtn: { backgroundColor: '#1f2937', color: 'white', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' },
  gridContainer: { display: 'flex', gap: '8px', padding: '10px 0', width: '100%', justifyContent: 'space-between', marginBottom: '25px', boxSizing: 'border-box' },
  holeNumber: { width: '90px', height: '60px', border: '2px solid #475569', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '26px', color: '#475569', backgroundColor: '#1e293b', margin: '8px 0', userSelect: 'none' }
};

const DASHBOARD_STYLE = {
  inlineDashboard: { width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '55px', backgroundColor: '#111827', padding: '16px', borderRadius: '24px', border: '1px solid #374151', boxSizing: 'border-box' },
  controlBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1f2937', padding: '12px 18px', borderRadius: '18px', border: '1px solid #374151', minWidth: 0, boxSizing: 'border-box', width: '100%', height: '70px' },
  playBtn: { border: 'none', backgroundColor: '#22c55e', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '3px' }
};

const MODAL_STYLE = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#111827', width: '480px', borderRadius: '24px', padding: '35px', border: '1px solid #374151', color: 'white' },
  saveBtn: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#10b981', color: 'black', fontWeight: '900', fontSize: '18px', cursor: 'pointer', marginTop: '22px' }
};

// 🎯 [도면 100% 완전 동기화 확정 데이터셋] 7, 8, 9, 10번 홀 물리적 배치 완벽 반영
const HARP_LAYOUT = {
  holes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  blow: [60, 64, 67, 72, 76, 79, 84, 88, 91, 96],       // 기본 부는 숨 라인
  draw: [62, 67, 71, 74, 77, 81, 83, 86, 89, 93],       // 기본 마시는 숨 라인
  topSpecial: [63, 68, 72, 75, 78, 82, null, 87, 90, 95], // 1~6 분홍오버블로우, 7공백, 8 Eb(하늘), 9 Gb(하늘), 10 B(하늘)
  bottomSpecials: [
    [61],                   // 1번 홀 bottom: Db4 (하늘색 1칸)
    [66, 65],               // 2번 홀 bottom: Gb4, F4 (하늘색 2칸)
    [70, 69, 68],           // 3번 홀 bottom: Bb4, A4, Ab4 (하늘색 3칸)
    [73],                   // 4번 홀 bottom: Db5 (하늘색 1칸)
    [],                     // 5번 홀 bottom: 완전 빈 공간
    [80],                   // 6번 홀 bottom: Ab5 (하늘색 1칸)
    [85],                   // 7번 홀 bottom: Db6 (주황색 1칸 오버드로우)
    [89],                   // 8번 홀 bottom: F6 (주황색 1칸 오버드로우)
    [92],                   // 9번 홀 bottom: Ab6 (주황색 1칸 오버드로우)
    [97]                    // 10번 홀 bottom: Db7 (주황색 1칸 오버드로우)
  ]
};

const STANDARD_SETTING_KEYS = {
  'G':      { offset: -5,  baseOct: 3 },
  'Ab':     { offset: -4,  baseOct: 3 },
  'A':      { offset: -3,  baseOct: 3 },
  'Bb':     { offset: -2,  baseOct: 3 },
  'B':      { offset: -1,  baseOct: 3 },
  'C':      { offset: 0,   baseOct: 4 }, 
  'Db':     { offset: 1,   baseOct: 4 },
  'D':      { offset: 2,   baseOct: 4 },
  'Eb':     { offset: 3,   baseOct: 4 },
  'E':      { offset: 4,   baseOct: 4 },
  'F':      { offset: 5,   baseOct: 4 },
  'F#':     { offset: 6,   baseOct: 4 },
  'High G': { offset: 7,   baseOct: 5 }
};

const LOW_SETTING_KEYS = {
  'Low G':  { offset: -5,  baseOct: 2 },
  'Low Ab': { offset: -4,  baseOct: 2 },
  'Low A':  { offset: -3,  baseOct: 2 },
  'Low Bb': { offset: -2,  baseOct: 2 },
  'Low B':  { offset: -1,  baseOct: 2 },
  'Low C':  { offset: 0,   baseOct: 3 }, 
  'Low Db': { offset: 1,   baseOct: 3 },
  'Low D':  { offset: 2,   baseOct: 3 },
  'Low Eb': { offset: 3,   baseOct: 3 },
  'Low E':  { offset: 4,   baseOct: 3 },
  'Low F':  { offset: 5,   baseOct: 3 },
  'Low F#': { offset: 6,   baseOct: 3 },
  'LL F':   { offset: 5,   baseOct: 2 }  
};

const keysCircleData = [
  { major: "C",  minor: "Am",  angle: 0,    idx: 0,  displaySig: "0",   type: "none" },
  { major: "G",  minor: "Em",  angle: 30,   idx: 1,  displaySig: "♯1",  type: "sharp" },
  { major: "D",  minor: "Bm",  angle: 60,   idx: 2,  displaySig: "♯2",  type: "sharp" },
  { major: "A",  minor: "F#m", angle: 90,   idx: 3,  displaySig: "♯3",  type: "sharp" },
  { major: "E",  minor: "C#m", angle: 120,  idx: 4,  displaySig: "♯4",  type: "sharp" },
  { major: "B",  minor: "G#m", angle: 150,  idx: 5,  displaySig: "♯5",  type: "sharp" },
  { major: "F#", minor: "D#m", angle: 180,  idx: 6,  displaySig: "♯6",  type: "sharp" },
  { major: "Db", minor: "Bbm", angle: 210,  idx: 7,  displaySig: "♭5",  type: "flat" },
  { major: "Ab", minor: "Fm",  angle: 240,  idx: 8,  displaySig: "♭4",  type: "flat" },
  { major: "Eb", minor: "Cm",  angle: 270,  idx: 9,  displaySig: "♭3",  type: "flat" },
  { major: "Bb", minor: "Gm",  angle: 300,  idx: 10, displaySig: "♭2",  type: "flat" },
  { major: "F",  minor: "Dm",  angle: 330,  idx: 11, displaySig: "♭1",  type: "flat" }
];

const romanDegrees = [
  { angle: 0,    text: "I" }, { angle: 30,   text: "V" }, { angle: 60,   text: "IIm" },
  { angle: 90,   text: "VIm" }, { angle: 120,  text: "IIIm" }, { angle: 150,  text: "VIIdim7" },
  { angle: 330,  text: "IV" }
];

const fixedPositionLabels = [
  { text: "1st",  harmonicaAngle: 0,   songAngle: 0 },
  { text: "2nd",  harmonicaAngle: 30,  songAngle: 330 },
  { text: "3rd",  harmonicaAngle: 60,  songAngle: 300 },
  { text: "4th",  harmonicaAngle: 90,  songAngle: 270 },
  { text: "5th",  harmonicaAngle: 120, songAngle: 240 },
  { text: "12th", harmonicaAngle: 330, songAngle: 30 }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('harmonica'); 
  const [scale, setScale] = useState(1);

  const [baseFreq, setBaseFreq] = useState(440);
  const [tolerance, setTolerance] = useState(10);
  const [reverbMix, setReverbMix] = useState(0.4); 
  const [programSettingMode, setProgramSettingMode] = useState('standard'); 

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY, 1)); 
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#050a14', width: '1920px', height: '1080px', color: 'white', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      fontFamily: 'sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative',
      transform: `scale(${scale})`, transformOrigin: 'center center'
    }}>
      {currentPage === 'harmonica' ? (
        <HarmonicaRoom 
          baseFreq={baseFreq} setBaseFreq={setBaseFreq}
          tolerance={tolerance} setTolerance={setTolerance}
          programSettingMode={programSettingMode} setProgramSettingMode={setProgramSettingMode}
          reverbMix={reverbMix} setReverbMix={setReverbMix}
          onRouteClick={() => setCurrentPage('newFeature')} 
        />
      ) : (
        <NewFeaturePage onRouteClick={() => setCurrentPage('harmonica')} />
      )}
    </div>
  );
}
function HarmonicaRoom({ baseFreq, setBaseFreq, tolerance, setTolerance, programSettingMode, setProgramSettingMode, reverbMix, setReverbMix, onRouteClick }) {
  const [currentKey, setCurrentKey] = useState(programSettingMode === 'standard' ? 'C' : 'Low C');
  const [activeNote, setActiveNote] = useState(null);
  const [activeAbsoluteSemi, setActiveAbsoluteSemi] = useState(null); 
  const [centsOff, setCentsOff] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState("No file");

  const [mrVolume, setMrVolume] = useState(0.8);
  const [micVolume, setMicVolume] = useState(0.8);
  const [synthVolume, setSynthVolume] = useState(0.5);
  const [useReverb, setUseReverb] = useState(true);

  const audioCtxRef = useRef(null);
  const mixedBus = useRef(null);
  const recordDestNode = useRef(null); 
  const mrGainNode = useRef(null);
  const micGainNode = useRef(null);
  const micRecordBooster = useRef(null); 
  const synthGainNode = useRef(null);
  const reverbWetGainNode = useRef(null); 
  const analyser = useRef(null);
  const micInput = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordedPlaying, setIsRecordedPlaying] = useState(false);

  const activeOscillators = useRef({});
  const clickedCellKey = useRef(null); 
  const audioPlaybackRef = useRef(null);
  const mrSourceRef = useRef(null);
  const mrBufferRef = useRef(null);
  const isListeningRef = useRef(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    setCurrentKey(programSettingMode === 'standard' ? 'C' : 'Low C');
  }, [programSettingMode]);

  const getHarpTargetSemi = (baseSemi) => {
    if (baseSemi === null) return null;
    const currentKeyObj = programSettingMode === 'standard' 
      ? (STANDARD_SETTING_KEYS[currentKey] || { offset: 0, baseOct: 4 })
      : (LOW_SETTING_KEYS[currentKey] || { offset: 0, baseOct: 3 });
      
    const baseOctaveShift = (currentKeyObj.baseOct - 4) * 12;
    return baseSemi + currentKeyObj.offset + baseOctaveShift;
  };

  const getNoteFreq = (baseSemi) => {
    const targetSemi = getHarpTargetSemi(baseSemi);
    return baseFreq * Math.pow(2, (targetSemi - 69) / 12);
  };

  const getNoteNameDisplay = (baseSemi) => {
    if (baseSemi === null) return null;
    const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const targetSemi = getHarpTargetSemi(baseSemi);
    return names[((targetSemi % 12) + 12) % 12];
  };

  useEffect(() => {
    if (mrGainNode.current) mrGainNode.current.gain.value = mrVolume;
  }, [mrVolume]);

  useEffect(() => {
    if (micGainNode.current) micGainNode.current.gain.value = micVolume * 2.0; 
    if (micRecordBooster.current) micRecordBooster.current.gain.value = micVolume * 3.5; 
  }, [micVolume]);

  useEffect(() => {
    if (synthGainNode.current) synthGainNode.current.gain.value = synthVolume;
  }, [synthVolume]);

  useEffect(() => {
    if (reverbWetGainNode.current && audioCtxRef.current) {
      const finalGain = useReverb ? reverbMix * 1.6 : 0.0;
      reverbWetGainNode.current.gain.setValueAtTime(finalGain, audioCtxRef.current.currentTime);
    }
  }, [useReverb, reverbMix]);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    mixedBus.current = ctx.createGain();
    mixedBus.current.connect(ctx.destination);
    recordDestNode.current = ctx.createMediaStreamDestination();

    mrGainNode.current = ctx.createGain();
    mrGainNode.current.gain.value = mrVolume;
    mrGainNode.current.connect(mixedBus.current);
    mrGainNode.current.connect(recordDestNode.current);

    micGainNode.current = ctx.createGain();
    micGainNode.current.gain.value = micVolume * 2.0; 
    micGainNode.current.connect(mixedBus.current);
    
    micRecordBooster.current = ctx.createGain();
    micRecordBooster.current.gain.value = micVolume * 3.5; 
    micGainNode.current.connect(micRecordBooster.current);
    micRecordBooster.current.connect(recordDestNode.current);

    reverbWetGainNode.current = ctx.createGain();
    reverbWetGainNode.current.gain.value = useReverb ? reverbMix * 1.6 : 0.0;

    const delay1 = ctx.createDelay(); delay1.delayTime.value = 0.045; 
    const delay2 = ctx.createDelay(); delay2.delayTime.value = 0.085; 
    const delay3 = ctx.createDelay(); delay3.delayTime.value = 0.180; 
    const delay4 = ctx.createDelay(); delay4.delayTime.value = 0.260; 

    const fb1 = ctx.createGain(); fb1.gain.value = 0.65; 
    const fb2 = ctx.createGain(); fb2.gain.value = 0.55;
    const fb3 = ctx.createGain(); fb3.gain.value = 0.45;

    const revFilter = ctx.createBiquadFilter();
    revFilter.type = "lowpass";
    revFilter.frequency.value = 2400; 

    delay1.connect(fb1); fb1.connect(delay2);
    delay2.connect(fb2); fb2.connect(delay3);
    delay3.connect(fb3); fb3.connect(revFilter);
    revFilter.connect(delay4);
    delay4.connect(delay1); 

    delay4.connect(reverbWetGainNode.current);
    reverbWetGainNode.current.connect(mixedBus.current);
    reverbWetGainNode.current.connect(recordDestNode.current); 

    audioCtxRef.current.reverbInput = delay1;

    synthGainNode.current = ctx.createGain();
    synthGainNode.current.gain.value = synthVolume; 
    synthGainNode.current.connect(mixedBus.current);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);
  const handleNoteStart = async (semi, boxKey) => {
    if (semi === null) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      if (activeOscillators.current[boxKey]) {
        try { activeOscillators.current[boxKey].osc.stop(); } catch(e){}
        activeOscillators.current[boxKey] = null;
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(getNoteFreq(semi), ctx.currentTime);
      gainNode.gain.setValueAtTime(synthVolume * 1.0, ctx.currentTime); 
      
      osc.connect(gainNode);
      gainNode.connect(synthGainNode.current);
      
      osc.start();
      activeOscillators.current[boxKey] = { osc, gainNode };
      
      clickedCellKey.current = boxKey;
      setActiveAbsoluteSemi(getHarpTargetSemi(semi));
      setActiveNote(getNoteNameDisplay(semi));
      setCentsOff(0); 
    } catch (e) {}
  };

  const handleNoteStop = (boxKey) => {
    if (activeOscillators.current[boxKey]) {
      try {
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const gainNode = activeOscillators.current[boxKey].gainNode;
        const osc = activeOscillators.current[boxKey].osc;
        
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.stop(now + 0.04);
      } catch(e) {}
      delete activeOscillators.current[boxKey];
    }
    if (clickedCellKey.current === boxKey) {
      clickedCellKey.current = null;
      if (!isListeningRef.current) {
        setActiveNote(null);
        setActiveAbsoluteSemi(null);
      }
    }
  };

  function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / SIZE) < 0.012) return -1;

    let yinBuffer = new Float32Array(SIZE / 2);
    for (let tau = 0; tau < SIZE / 2; tau++) {
      for (let i = 0; i < SIZE / 2; i++) {
        let delta = buf[i] - buf[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }

    let runningSum = 0;
    for (let tau = 1; tau < SIZE / 2; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / (runningSum || 1);
    }

    let threshold = 0.15, tauFound = -1;
    for (let tau = 1; tau < SIZE / 2; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < SIZE / 2 && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        tauFound = tau;
        break;
      }
    }

    if (tauFound === -1) return -1;
    return sampleRate / tauFound;
  }

  const startMic = async () => {
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,  
          noiseSuppression: false,  
          autoGainControl: false,   
          highpassFilter: false,
          latency: 0                
        } 
      });
      micInput.current = stream;
      
      const source = ctx.createMediaStreamSource(stream);
      
      const highPassFilter = ctx.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 65; 

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, ctx.currentTime);
      compressor.knee.setValueAtTime(6, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.005, ctx.currentTime);
      compressor.release.setValueAtTime(0.08, ctx.currentTime);

      analyser.current = ctx.createAnalyser();
      analyser.current.fftSize = 1024; 
      
      source.connect(highPassFilter);
      highPassFilter.connect(compressor);
      compressor.connect(analyser.current);
      compressor.connect(micGainNode.current);

      if (ctx.reverbInput) {
        compressor.connect(ctx.reverbInput); 
      }

      setIsListening(true);
      isListeningRef.current = true;
      
      const allValidHarpSemis = [
        46, 94, 
        ...HARP_LAYOUT.topSpecial,
        ...HARP_LAYOUT.blow,
        ...HARP_LAYOUT.draw
      ];
      HARP_LAYOUT.bottomSpecials.forEach(arr => {
        arr.forEach(val => allValidHarpSemis.push(val));
      });

      const updateLoop = () => {
        if (!analyser.current || !isListeningRef.current) return;
        const buf = new Float32Array(1024);
        analyser.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, ctx.sampleRate);
        if (freq !== -1 && freq >= 40 && freq <= 3500) {
          const n = 12 * Math.log2(freq / baseFreq) + 69;
          const roundedN = Math.round(n);
          
          const hasMatchingCell = allValidHarpSemis.some(baseSemi => getHarpTargetSemi(baseSemi) === roundedN);

          if (hasMatchingCell) {
            const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
            const correctedIdx = ((roundedN % 12) + 12) % 12;
            setActiveNote(names[correctedIdx]);

            if (!clickedCellKey.current) {
              setActiveAbsoluteSemi(roundedN);
              setCentsOff(Math.floor((n - roundedN) * 100));
            }
          } else {
            if (!clickedCellKey.current) {
              setActiveNote(null);
              setActiveAbsoluteSemi(null);
            }
          }
        } else {
          if (!clickedCellKey.current) {
            setActiveNote(null);
            setActiveAbsoluteSemi(null);
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      };
      updateLoop();
    } catch (err) { alert("Mic access denied or HTTPS security issue."); }
  };

  const stopMic = () => {
    cancelAnimationFrame(animationFrameRef.current);
    if (micInput.current) {
      micInput.current.getTracks().forEach(track => track.stop());
      micInput.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    setActiveNote(null);
    setActiveAbsoluteSemi(null);
    if (isRecording) stopRecordingSession();
  };

  const startRecordingSession = () => {
    if (!audioCtxRef.current || !recordDestNode.current) return alert("Initialize audio layer first!");
    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(recordDestNode.current.stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch(e) { alert("Recording system initialization failed."); }
  };

  const stopRecordingSession = () => {
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch(e){}
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; 
      setFileName(file.name);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        mrBufferRef.current = buffer;
      } catch (err) { alert("Audio parsing error."); }
    }
  };

  const toggleTrack = async () => {
    if (!mrBufferRef.current) return alert("Upload MR file first!");
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    if (isPlaying) {
      if (mrSourceRef.current) {
        try { mrSourceRef.current.stop(0); } catch(e){}
        try { mrSourceRef.current.disconnect(); } catch(e){}
        mrSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      try {
        const source = ctx.createBufferSource();
        source.buffer = mrBufferRef.current;
        source.connect(mrGainNode.current);
        source.onended = () => {
          if (mrSourceRef.current === source) {
            setIsPlaying(false);
            mrSourceRef.current = null;
          }
          try { source.disconnect(); } catch(e){}
        };
        source.start(0);
        mrSourceRef.current = source;
        setIsPlaying(true);
      } catch(err) { alert("MR playback error."); }
    }
  };

  const toggleRecordedPlayback = () => {
    if (!audioPlaybackRef.current) return;
    if (isRecordedPlaying) { audioPlaybackRef.current.pause(); setIsRecordedPlaying(false); }
    else { audioPlaybackRef.current.play(); setIsRecordedPlaying(true); }
  };
  return (
    <div style={BOX_STYLE.contentWrapper}>
      {/* 상단 제어 및 동적 필터링 드롭다운 바 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '25px', boxSizing: 'border-box' }}>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={onRouteClick} style={{ ...BOX_STYLE.routeBtn, backgroundColor: '#1f2937', color: 'white' }}>Circle of Fifths</button>
        </div>
        
        {/* 프로그램 세팅 상태에 따라 목록 구성원이 완벽히 제어되는 동적 Harp Key 창 */}
        <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#94a3b8' }}>Harp Key</span>
          <select 
            style={BOX_STYLE.selectBox} 
            value={currentKey} 
            onChange={(e) => setCurrentKey(e.target.value)}
          >
            {programSettingMode === 'standard' 
              ? Object.keys(STANDARD_SETTING_KEYS).map(k => <option key={k} value={k}>{k}</option>)
              : Object.keys(LOW_SETTING_KEYS).map(k => <option key={k} value={k}>{k}</option>)
            }
          </select>
        </div>
        
        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
          <button onClick={isListening ? stopMic : startMic} style={{...BOX_STYLE.micBtn, backgroundColor: isListening ? '#ef4444' : '#2563eb', padding: '12px 35px', width: '190px', justifyContent: 'center'}}>
            <Mic size={22} /> {isListening ? 'MIC ACTIVE' : 'START MIC'}
          </button>
        </div>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowSettings(true)} style={BOX_STYLE.settingsBtn}><Settings size={22} /> Settings</button>
        </div>
      </div>

      {/* 🎯 [도면 안내 지침 100% 완전 동기화 인터랙티브 자판 격자 레이아웃] */}
      <div style={BOX_STYLE.gridContainer}>
        {HARP_LAYOUT.holes.map((h, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            
            {/* 10번 홀 바로 위에 단독으로 얹혀 수립되는 하늘색 고공 복층 Bb 칸 (도면 매칭) */}
            {h === 10 ? (
              <NoteBox semi={94} getNote={getNoteNameDisplay} getAbsSemi={getHarpTargetSemi} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isTopBb={true} boxKey={`top-bb-${i}`} clickedCellKey={clickedCellKey} />
            ) : (
              <div style={{ height: '90px', width: '90px', margin: '3px 0' }}></div>
            )}

            {/* 최상단 특수 일반 벤딩존 (1~6번 분홍색 오버블로우 / 7번 완전 공백 / 8번 Eb, 9번 Gb, 10번 B 하늘색 박스 상시 개방) */}
            <NoteBox semi={HARP_LAYOUT.topSpecial[i]} getNote={getNoteNameDisplay} getAbsSemi={getHarpTargetSemi} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isBlowZone={true} holeNum={h} boxKey={`top-spec-${i}`} clickedCellKey={clickedCellKey} />
            
            {/* 기본 부는 숨 (Blow) 구역 - 홀 넘버와 완벽하게 일치하는 진한 회색(#475569) 음정 폰트 바인딩 */}
            <NoteBox semi={HARP_LAYOUT.blow[i]} getNote={getNoteNameDisplay} getAbsSemi={getHarpTargetSemi} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isBasicBlow={true} holeNum={h} boxKey={`blow-${i}`} clickedCellKey={clickedCellKey} />
            
            {/* 실물 가이드 넘버 락 사각형 (1 ~ 10) */}
            <div style={BOX_STYLE.holeNumber}>{h}</div>
            
            {/* 기본 마시는 숨 (Draw) 구역 - 홀 넘버와 완벽하게 일치하는 진한 회색(#475569) 음정 폰트 바인딩 */}
            <NoteBox semi={HARP_LAYOUT.draw[i]} getNote={getNoteNameDisplay} getAbsSemi={getHarpTargetSemi} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isBasicDraw={true} holeNum={h} boxKey={`draw-${i}`} clickedCellKey={clickedCellKey} />
            
            {/* 하단 다단 오버드로우 및 특수 벤딩 구역 (1~6번 하늘색 다단 / 5번 공백 / 7번 Db 주황색 단층 / 8번 F 주황색 단층 / 9번 Ab 주황색 단층 / 10번 Db 주황색 단층 완벽 정렬) */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '280px', gap: '4px' }}>
              {HARP_LAYOUT.bottomSpecials[i].map((semiVal, sIdx) => (
                <NoteBox key={sIdx} semi={semiVal} getNote={getNoteNameDisplay} getAbsSemi={getHarpTargetSemi} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isDrawZone={true} holeNum={h} boxKey={`bot-spec-${i}-${sIdx}`} clickedCellKey={clickedCellKey} />
              ))}
            </div>

            {/* 우하단 브랜드 워터마크 안내 문자 각인 */}
            {h === 10 && (
              <div style={{ position: 'absolute', bottom: '-5px', right: '0px', width: '650px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', zIndex: 10, fontFamily: 'sans-serif', lineHeight: '1.4' }}>
                <div style={{ fontSize: '34.2px', fontWeight: '900', color: '#10b981', marginBottom: '16px', letterSpacing: '-0.5px' }}>Harmonica Training Center</div>
                <div style={{ color: '#475569', fontSize: '12.6px', fontWeight: '600' }}>Copyright ⓒ 2026 CoffeeBada Lee, Choong-Koo All Rights Reserved.</div>
                <div style={{ color: '#64748b', fontSize: '12.6px', fontWeight: '600', marginTop: '2px' }}>Contact : 279.lee@gmail.com</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 가상 믹싱 버스 제어판 대시보드 */}
      <div style={DASHBOARD_STYLE.inlineDashboard}>
        <div style={DASHBOARD_STYLE.controlBox}>
          <label style={{ cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
            <Upload size={22} />
            <input type="file" onChange={handleFileUpload} hidden accept="audio/*" />
            <span style={{ fontSize: '14px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{fileName}</span>
          </label>
          <button onClick={toggleTrack} style={DASHBOARD_STYLE.playBtn}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
          <div style={{ flex: 1, minWidth: 0, marginLeft: '8px' }}><span style={DASHBOARD_STYLE.label}>MR VOL</span><input type="range" min="0" max="1" step="0.01" value={mrVolume} onChange={(e) => setMrVolume(parseFloat(e.target.value))} style={{ width: '100%' }} /></div>
        </div>

        <div style={{ ...DASHBOARD_STYLE.controlBox, justifyContent: 'center' }}>
          <button onClick={isRecording ? stopRecordingSession : startRecordingSession} style={{ backgroundColor: isRecording ? '#ef4444' : '#374151', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isRecording ? <Square size={14} /> : <Mic size={14} />} {isRecording ? "STOP MIX" : "REC MIX"}
          </button>
          {recordedUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #4b5563', overflow: 'hidden' }}>
              <audio ref={audioPlaybackRef} src={recordedUrl} onEnded={() => setIsRecordedPlaying(false)} style={{ display: 'none' }} />
              <button onClick={toggleRecordedPlayback} style={{ border: 'none', backgroundColor: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isRecordedPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <a href={recordedUrl} download="harmonica_session.wav" style={{ color: '#10b981', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Download size={22} /></a>
            </div>
          )}
        </div>

        <div style={DASHBOARD_STYLE.controlBox}>
          <Mic size={22} color="#94a3b8" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, marginLeft: '8px' }}><span style={DASHBOARD_STYLE.label}>MIC VOL</span><input type="range" min="0" max="1" step="0.01" value={micVolume} onChange={(e) => setMicVolume(parseFloat(e.target.value))} style={{ width: '100%' }} /></div>
          {isListening && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '55px', flexShrink: 0, marginLeft: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: '900', fontSize: '18px' }}>{activeNote || '---'}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{centsOff}¢</span>
            </div>
          )}
        </div>
      </div>

      {/* 설정 세팅 창 레이어 팝업 */}
      {showSettings && (
        <div style={MODAL_STYLE.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={MODAL_STYLE.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#10b981' }}>Settings</h2>
              <X size={28} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowSettings(false)} />
            </div>

            <div style={{ marginBottom: '16px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
              <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Program Key Mode</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  onClick={() => setProgramSettingMode('standard')} 
                  style={{ padding: '12px', backgroundColor: programSettingMode === 'standard' ? '#10b981' : '#374151', color: programSettingMode === 'standard' ? 'black' : 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.12s ease' }}
                >
                  기본 세팅 (Standard)
                </button>
                <button 
                  onClick={() => setProgramSettingMode('low')} 
                  style={{ padding: '12px', backgroundColor: programSettingMode === 'low' ? '#10b981' : '#374151', color: programSettingMode === 'low' ? 'black' : 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.12s ease' }}
                >
                  로우 세팅 (Low Key)
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold' }}>Reference Pitch</span>
                <span style={{ fontSize: '15px', color: '#10b981', fontWeight: '900' }}>{baseFreq} Hz</span>
              </div>
              <input type="range" min="430" max="450" step="1" value={baseFreq} onChange={(e) => setBaseFreq(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
            
            <div style={{ marginBottom: '16px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
              <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Tuner Tolerance (Cents)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[5, 10, 15, 20].map((val) => ( // 🎯 [런타임 에러 완전 수정 완료 지점]
                  <button key={val} onClick={() => setTolerance(val)} style={{ padding: '10px', backgroundColor: tolerance === val ? '#10b981' : '#374151', color: tolerance === val ? 'black' : 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                    ±{val}¢
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold' }}>Mic Reverb Effect</span>
                <button onClick={() => setUseReverb(!useReverb)} style={{ padding: '6px 16px', backgroundColor: useReverb ? '#10b981' : '#ef4444', border: 'none', color: useReverb ? 'black' : 'white', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>{useReverb ? 'ON' : 'OFF'}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', width: '70px' }}>REVERB MIX</span>
                <input type="range" min="0" max="1" step="0.01" disabled={!useReverb} value={reverbMix} onChange={(e) => setReverbMix(parseFloat(e.target.value))} style={{ flex: 1, cursor: useReverb ? 'pointer' : 'not-allowed', opacity: useReverb ? 1 : 0.4 }} />
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', width: '35px', textAlign: 'right' }}>{Math.round(reverbMix * 100)}%</span>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} style={MODAL_STYLE.saveBtn}>SAVE & CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
// 🎯 [사각형 개별 노드 모듈 컴포넌트 - 도면 색상 및 글자색 매칭 최종 완벽 최적화]
function NoteBox({ semi, getNote, getAbsSemi, activeAbsoluteSemi, cents, limit, onStart, onStop, isTopBb, boxKey, clickedCellKey, isBlowZone, isDrawZone, holeNum, isBasicBlow, isBasicDraw }) {
  if (semi === null) return <div style={{ height: '90px', width: '90px', margin: '3px 0' }}></div>;
  
  const noteName = getNote(semi);
  const currentBoxAbsSemi = getAbsSemi(semi);
  const isCurrentlyListening = activeAbsoluteSemi === currentBoxAbsSemi && !clickedCellKey.current;
  const isCurrentlyClicked = clickedCellKey.current === boxKey;
  
  const isActive = isCurrentlyListening || isCurrentlyClicked;
  const safeCents = Math.max(-limit, Math.min(limit, cents));
  const indicatorLeft = isCurrentlyClicked ? 50 : (50 + (safeCents / limit) * 40);

  // 🎨 [도면 이미지 스킨 컬러 가이드라인 100% 동기화 필터 수정]
  let bgColor = '#1e293b'; 
  let borderStyle = '1px solid #334155';
  
  if (isActive) {
    if (isCurrentlyClicked) {
      bgColor = '#22c55e'; // 연주 클릭 시 시각 피드백
    } else {
      bgColor = Math.abs(cents) <= limit ? '#22c55e' : (cents > limit ? '#eab308' : '#ef4444');
    }
  } else {
    if (isTopBb) {
      bgColor = '#93c5fd'; // 10번 홀 최상단 단독 Bb 칸 (하늘색)
    } else if (isBlowZone) {
      // 1~6번 최상단 오버블로우는 분홍색, 8~10번 최상단 벤딩은 하늘색
      const isOverblow = holeNum >= 1 && holeNum <= 6;
      bgColor = isOverblow ? '#fca5a5' : '#93c5fd';
    } else if (isBasicBlow || isBasicDraw) {
      bgColor = '#e2e8f0'; // 🎯 [요구사항 반영]: 기본 음정 칸 배경은 눈이 편안한 밝은 회색 사각형 고정
    } else if (isDrawZone) {
      // 1~6번 하단 벤딩은 하늘색, 7~10번 하단 오버드로우는 주황색 고정
      const isOrangeOverdraw = holeNum >= 7 && holeNum <= 10;
      bgColor = isOrangeOverdraw ? '#f59e0b' : '#93c5fd';
    }
  }

  // 🎯 [요구사항 반영]: 기본 불고 마시는 숨(밝은 회색 사각형) 라인의 음정 글자 색상을 홀 숫자 컬러(#475569)와 정밀 일치
  const fontColor = (isBasicBlow || isBasicDraw) ? '#475569' : 'black';

  return (
    <div 
      style={{ 
        width: '90px', height: '90px', margin: '3px 0', borderRadius: '14px', border: borderStyle, backgroundColor: bgColor, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', 
        cursor: 'pointer', userSelect: 'none', touchAction: 'none' 
      }} 
      onMouseDown={() => onStart(semi, boxKey)} 
      onMouseUp={() => onStop(boxKey)} 
      onMouseLeave={() => onStop(boxKey)} 
      onTouchStart={() => onStart(semi, boxKey)} 
      onTouchEnd={() => onStop(boxKey)}
    >
      <span style={{ fontWeight: '900', fontSize: '24px', color: fontColor }}>{noteName}</span>
      {isActive && <div style={{ position: 'absolute', left: `${indicatorLeft}%`, width: '4px', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', transition: 'left 0.04s ease-out' }}></div>}
    </div>
  );
}

// 🎯 [5도권 시각화 페이지 컴포넌트 구역]
function NewFeaturePage({ onRouteClick }) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState('harmonica'); 
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const mainWrapperRef = useRef(null);
  const dragStartAngle = useRef(0);
  const baseRotationOnDragStart = useRef(0);

  const majorCircleRadius = 298.0;
  const minorCircleRadius = 181.0;
  const staffCircleRadius = 412.0;    
  const romanCircleRadius = 345.0;    
  const positionCircleRadius = 245.5;

  const currentSelectedKey = keysCircleData[activeIndex];

  const getKeyByOffsetAngle = (offsetAngle) => {
    const slotOffset = offsetAngle / 30;
    return keysCircleData[(activeIndex + slotOffset + 12) % 12];
  };

  const rotateWheelToKey = (item) => {
    const targetBaseAngle = item.angle;
    let currentNormalized = rotationAngle % 360;
    let diff = (-targetBaseAngle - currentNormalized) % 360;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const finalAngle = rotationAngle + diff;
    setRotationAngle(finalAngle);
    
    const finalCalculatedIndex = (Math.round(-finalAngle / 30) % 12 + 12) % 12;
    setActiveIndex(finalCalculatedIndex);
  };

  const getMouseAngle = (clientX, clientY) => {
    if (!mainWrapperRef.current) return 0;
    const rect = mainWrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const onDragStart = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    const clientX = e.clientX || (e.touches && e.touches ? e.touches.clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches ? e.touches.clientY : 0);
    setIsDragging(true);
    dragStartAngle.current = getMouseAngle(clientX, clientY);
    baseRotationOnDragStart.current = rotationAngle;
  };

  useEffect(() => {
    const onDragMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches ? e.touches.clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches ? e.touches.clientY : 0);
      
      const currentMouseAngle = getMouseAngle(clientX, clientY);
      let angleDifference = currentMouseAngle - dragStartAngle.current;

      if (angleDifference > 180) angleDifference -= 360;
      if (angleDifference < -180) angleDifference += 360;

      const nextAngle = baseRotationOnDragStart.current + angleDifference;
      setRotationAngle(nextAngle);

      const currentSnappedIndex = (Math.round(-nextAngle / 30) % 12 + 12) % 12;
      setActiveIndex(currentSnappedIndex);
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const targetSnapAngle = Math.round(rotationAngle / 30) * 30;
      setRotationAngle(targetSnapAngle);

      const finalCalculatedIndex = (Math.round(-targetSnapAngle / 30) % 12 + 12) % 12;
      setActiveIndex(targetSnapAngle);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isDragging, rotationAngle]);

  const toggleDisplayMode = () => {
    setDisplayMode(prev => (prev === 'harmonica' ? 'song' : 'harmonica'));
  };

  return (
    <div style={CIRCLE_STYLE.container}>
      <div style={{ position: 'absolute', top: '30px', left: '420px', zIndex: 5000 }}>
        <button onClick={onRouteClick} style={{ ...BOX_STYLE.routeBtn, backgroundColor: '#1f2937', color: 'white' }}>Harmonica Training</button>
      </div>

      <div ref={mainWrapperRef} style={CIRCLE_STYLE.circleWrapper} onMouseDown={onDragStart} onTouchStart={onDragStart}>
        <div style={CIRCLE_STYLE.rotatableWheel(rotationAngle, isDragging)}>
          <div style={CIRCLE_STYLE.wheelBg}></div>
          <div style={CIRCLE_STYLE.innerMask}></div>
          
          <div style={CIRCLE_STYLE.textLayerWrapper}>
            {keysCircleData.map((item) => {
              const rad = ((item.angle - 90) * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              const isHoveredActive = hoveredIdx === item.idx;

              return (
                <React.Fragment key={item.idx}>
                  <button 
                    style={{ ...CIRCLE_STYLE.nodeSectorBtn, ...CIRCLE_STYLE.btnStyleMaj, left: `calc(50% + ${majorCircleRadius * cos}px)`, top: `calc(50% + ${majorCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}
                    onMouseEnter={() => setHoveredIdx(item.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={(e) => { e.stopPropagation(); rotateWheelToKey(item); }}
                  >
                    {item.major}
                  </button>
                  <button 
                    style={{ ...CIRCLE_STYLE.nodeSectorBtn, ...CIRCLE_STYLE.btnStyleMin, left: `calc(50% + ${minorCircleRadius * cos}px)`, top: `calc(50% + ${minorCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}
                    onMouseEnter={() => setHoveredIdx(item.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={(e) => { e.stopPropagation(); rotateWheelToKey(item); }}
                  >
                    {item.minor}
                  </button>
                  <div style={{ ...CIRCLE_STYLE.signatureTextBadge(isHoveredActive ? 1 : 0, item.type === 'sharp', item.type === 'flat'), left: `calc(50% + ${staffCircleRadius * cos}px)`, top: `calc(50% + ${staffCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}>
                    {item.displaySig}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ ...CIRCLE_STYLE.centerCore, left: 'calc(50% - 90px)', top: 'calc(50% - 90px)' }}>
          <div style={CIRCLE_STYLE.coreCenterContent}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '4px', color: displayMode === 'harmonica' ? '#e51c23' : '#00a8ff', transition: 'color 0.3s' }}>
              {displayMode === 'harmonica' ? 'Harp Key' : 'Song Key'}
            </span>
            <span style={{ fontWeight: '900', fontSize: displayMode === 'harmonica' ? '39px' : '22px', color: displayMode === 'harmonica' ? '#0056b3' : '#2ed573', transition: 'color 0.3s, font-size 0.3s' }}>
              {displayMode === 'harmonica' ? currentSelectedKey.major : `${currentSelectedKey.major} Maj / ${currentSelectedKey.major}m`}
            </span>
          </div>

          <svg style={CIRCLE_STYLE.staticCurvedSvgOverlay} viewBox="0 0 184 184">
            <defs>
              <path id="core-top-path" d="M 17,92 A 75,75 0 1,1 167,92" />
              <path id="core-bottom-path" d="M 6,92 A 86,86 0 0,0 178,92" /> 
            </defs>
            <text fontSize="16.7px" fontWeight="black" fill="#f59b0b" letterSpacing="0.2px">
              <textPath href="#core-top-path" startOffset="50%" textAnchor="middle">The Circle of Fifths</textPath>
            </text>
            <text fontSize="11.7px" fontWeight="bold" fill="#94a3b8" letterSpacing="-0.3px">
              <textPath href="#core-bottom-path" startOffset="50%" textAnchor="middle">Copyright © 2026. coffeebada All rights reserved.</textPath>
            </text>
          </svg>
        </div>

        <div style={CIRCLE_STYLE.staticOverlayLayer}>
          {romanDegrees.map((degree, dIdx) => {
            const rad = ((degree.angle - 90) * Math.PI) / 180;
            return (
              <div key={dIdx} style={{ ...CIRCLE_STYLE.romanDegreeBadge, left: `calc(50% + ${romanCircleRadius * Math.cos(rad)}px)`, top: `calc(50% + ${romanCircleRadius * Math.sin(rad)}px)`, transform: 'translate(-50%, -50%)' }}>
                {degree.text}
              </div>
            );
          })}
          {fixedPositionLabels.map((pos, pIdx) => {
            const targetAngle = displayMode === 'harmonica' ? pos.harmonicaAngle : pos.songAngle;
            const rad = ((targetAngle - 90) * Math.PI) / 180;
            return (
              <div key={pIdx} style={{ ...CIRCLE_STYLE.staticFixedPositionBadge, left: `calc(50% + ${positionCircleRadius * Math.cos(rad)}px - 25px)`, top: `calc(50% + ${positionCircleRadius * Math.sin(rad)}px - 15px)` }}>
                {pos.text}
              </div>
            );
          })}
        </div>
      </div>

      <div style={CIRCLE_STYLE.tablePanel}>
        <div style={CIRCLE_STYLE.clickablePanelTitle} onClick={toggleDisplayMode}>
          <span style={{ fontWeight: '900', color: '#ffffff' }}>{displayMode === 'harmonica' ? 'Harmonica Key' : 'Song Key'}</span>
          <span style={CIRCLE_STYLE.dynamicTitleValue(displayMode === 'harmonica')}>
            {displayMode === 'harmonica' ? currentSelectedKey.major : `${currentSelectedKey.major} Maj / ${currentSelectedKey.major}m`}
          </span>
        </div>

        <table style={CIRCLE_STYLE.table}>
          <thead>
            <tr>
              <th colSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.headerTheme(displayMode === 'harmonica') }}>
                {displayMode === 'harmonica' ? 'Song Key' : 'Harp Key'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.bgGray, width: '25%' }}>Major</td>
              <td style={{ ...CIRCLE_STYLE.thTd, width: '40%' }}>1st Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold', color: '#cbd5e1' }}>
                {getKeyByOffsetAngle(0).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>2nd Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(30).major : getKeyByOffsetAngle(-30).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>12th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(-30).major : getKeyByOffsetAngle(30).major}
              </td>
            </tr>
            <tr>
              <td rowSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.bgGray }}>minor</td>
              <td style={CIRCLE_STYLE.thTd}>3rd Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(60).minor : getKeyByOffsetAngle(-60).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>4th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? currentSelectedKey.minor : getKeyByOffsetAngle(-90).major}
              </td>
            </tr>
            <tr>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>5th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(120).minor : getKeyByOffsetAngle(-120).major}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CIRCLE_STYLE = {
  container: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '80px', width: '100%', height: '100%', boxSizing: 'border-box' },
  circleWrapper: { position: 'relative', width: '920px', height: '920px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rotatableWheel: (angle, isDragging) => ({ position: 'absolute', width: '740px', height: '740px', borderRadius: '50%', zIndex: 10, transform: `rotate(${angle}deg)`, cursor: isDragging ? 'grabbing' : 'grab', overflow: 'visible', transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }),
  wheelBg: { width: '100%', height: '100%', borderRadius: '50%', position: 'absolute', background: 'conic-gradient(#e51c23 0deg 30deg, #f57c00 30deg 60deg, #ffb74d 60deg 90deg, #fdd835 90deg 120deg, #aeea00 120deg 150deg, #4caf50 150deg 180deg, #00b0ff 180deg 210deg, #00e5ff 210deg 240deg, #2979ff 240deg 270deg, #3f51b5 270deg 300deg, #673ab7 300deg 330deg, #e91e63 330deg 360deg)', transform: 'rotate(-15deg)', zIndex: 1 },
  innerMask: { position: 'absolute', width: '448px', height: '448px', backgroundColor: '#050a14', borderRadius: '50%', top: '146px', left: '146px', zIndex: 2, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)' }, 
  centerCore: { position: 'absolute', width: '180px', height: '180px', backgroundColor: '#111827', borderRadius: '50%', zIndex: 30, border: '2px solid #374151', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', overflow: 'visible' },
  coreCenterContent: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 35, textAlign: 'center', width: '170px' },
  staticCurvedSvgOverlay: { position: 'absolute', top: '-2px', left: '-2px', width: '184px', height: '184px', zIndex: 32 },
  textLayerWrapper: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 5 },
  nodeSectorBtn: { position: 'absolute', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0, zIndex: 12 },
  btnStyleMaj: { width: '70px', height: '50px', fontSize: '30px', fontWeight: '900', color: '#ffffff', textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px -1px 0 #000, 2px 1px 0 #000, 0px -2px 0 #000, 0px 2px 0 #000, 0px 3px 5px rgba(0,0,0,0.9)' },
  btnStyleMin: { width: '60px', height: '40px', fontSize: '18px', fontWeight: '800', color: '#a3b8cc', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' },
  signatureTextBadge: (opacity, isSharp, isFlat) => ({ position: 'absolute', zIndex: 11, fontSize: opacity === 1 ? '34px' : '28px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: opacity, color: isSharp ? '#ef4444' : (isFlat ? '#3b82f6' : '#64748b'), transition: 'opacity 0.15s ease, transform 0.4s' }),
  romanDegreeBadge: { position: 'absolute', zIndex: 8, fontSize: '20px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  staticOverlayLayer: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 20, pointerEvents: 'none' },
  staticFixedPositionBadge: { position: 'absolute', zIndex: 25, width: '50px', height: '30px', fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.65)' },
  tablePanel: { width: '450px' },
  clickablePanelTitle: { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #374151', padding: '0 16px', borderRadius: '12px', backgroundColor: '#111827', height: '55px', border: '1px solid #374151', boxSizing: 'border-box' },
  dynamicTitleValue: (isBlue) => ({ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.3px', color: isBlue ? '#3b82f6' : '#10b981' }),
  table: { width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' },
  thTd: { border: '1px solid #374151', padding: '16px 14px', textAlign: 'center', fontSize: '18px', color: '#cbd5e1' },
  headerTheme: (isGreen) => ({ backgroundColor: isGreen ? '#10b981' : '#2563eb', color: 'white', fontWeight: 'bold', fontSize: '20px' }),
  bgGray: { backgroundColor: '#1f2937', fontWeight: 'bold', fontSize: '18px', color: '#94a3b8' }
};
