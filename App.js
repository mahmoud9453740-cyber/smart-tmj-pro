import { deviceManager } from './src/ble';

import React, { useState, useEffect } from 'react';
import {
  View, Text as RNText, ScrollView, TouchableOpacity, TextInput as RNTextInput, SafeAreaView,
  StatusBar, StyleSheet, Switch, Alert, Linking, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useSensorMonitor } from './src/ble/useSensorMonitor';
import { getSavedMonitoringEvents } from './src/ble/sessionStorage';

const translations = {
  "Home": "الرئيسية",
  "Monitor": "المراقبة",
  "Rehab": "التأهيل",
  "Progress": "التقدم",
  "More": "المزيد",
  "Night Mode": "الوضع الليلي",
  "Exercises": "التمارين",
  "Results": "النتائج",
  "Profile": "الملف الشخصي",
  "Devices": "الأجهزة",
  "Videos": "مكتبة الفيديوهات",
  "Patients": "المرضى",
  "ClinicalTimeline": "السجل السريري",
  "Day Mode": "الوضع النهاري",
  "Night Guard": "واقي الأسنان",
  "Smart Watch": "الساعة الذكية",
  "AI": "المساعد الذكي",
  "Welcome": "مرحبًا",
  "Your jaw health at a glance": "صحة الفك في لمحة",
  "TMJ PHYSIOTHERAPY & BRUXISM CARE": "العلاج الطبيعي للفك وعلاج صرير الأسنان",
  "Device Connected": "الجهاز متصل",
  "Device Disconnected": "الجهاز غير متصل",
  "Connect Device": "توصيل الجهاز",
  "Disconnect": "قطع الاتصال",
  "Today's Overview": "ملخص اليوم",
  "Jaw Activity (Real-time)": "نشاط الفك (مباشر)",
  "Live": "مباشر",
  "No live sensor data": "لا توجد بيانات حساسات مباشرة",
  "TMJ Video Library": "مكتبة فيديوهات المفصل الفكي الصدغي",
  "Educational videos and clinical resources": "فيديوهات تعليمية ومصادر سريرية",
  "Learn. Practice. Understand.": "تعلّم. تدرّب. افهم.",
  "Search videos or topics...": "ابحث عن فيديو أو موضوع...",
  "Resources": "مصادر",
  "Open Video / Resource": "فتح الفيديو / المصدر",
  "Source:": "المصدر:",
  "Exercise Guide": "دليل التمارين",
  "Active Session": "جلسة نشطة",
  "Instructions": "التعليمات",
  "Video Resource": "مصدر الفيديو",
  "Open TMJ Video Library": "فتح مكتبة فيديوهات الفك",
  "Search this topic on YouTube": "ابحث عن هذا الموضوع على يوتيوب",
  "Start this exercise": "ابدأ التمرين",
  "Back to library": "العودة للمكتبة",
  "Clinical Safety": "إرشادات السلامة",
  "Relaxation": "الاسترخاء",
  "Jaw Mobility": "حركة الفك",
  "Muscle Relaxation": "إرخاء العضلات",
  "Neck & Posture": "الرقبة ووضعية الجسم",
  "All": "الكل",
  "Rocabado": "روكابادو",
  "Bruxism": "صرير الأسنان",
  "TMJ Education": "التثقيف حول المفصل الفكي",
  "Pain Management": "إدارة الألم",
  "Clinical Resources": "مصادر سريرية",
  "Beginner": "مبتدئ",
  "Intermediate": "متوسط",
  "Advanced": "متقدم",
  "minutes": "دقائق",
  "Suggested duration": "المدة المقترحة",
  "Rehabilitation focus": "هدف التأهيل",
  "Relevant muscle groups": "المجموعات العضلية المستهدفة",
  "Movement category": "نوع الحركة",
  "Pain Level (VAS)": "مستوى الألم (VAS)",
  "Jaw Opening": "مدى فتح الفم",
  "Bruxism Events": "نوبات صرير الأسنان",
  "Reports": "التقارير",
  "Last Night": "الليلة الماضية",
  "7 Days": "7 أيام",
  "30 Days": "30 يومًا",
  "Save": "حفظ",
  "Cancel": "إلغاء",
  "Delete": "حذف",
  "Edit": "تعديل",
  "Add": "إضافة",
  "Search": "بحث",
  "Name": "الاسم",
  "Age": "العمر",
  "Patient": "المريض",
  "Patient name required": "اسم المريض مطلوب",
  "Enter a name before creating a patient record.": "أدخل الاسم قبل إنشاء ملف المريض.",
  "Settings": "الإعدادات",
  "Language": "اللغة",
  "Arabic": "العربية",
  "English": "الإنجليزية",
  "Invalid link": "رابط غير صالح",
  "This link is not valid.": "هذا الرابط غير صالح.",
  "Unable to open link": "تعذر فتح الرابط",
  "Please try again or open the link manually.": "حاول مرة أخرى أو افتح الرابط يدويًا.",
  "Loading Smart TMJ...": "جارٍ تحميل Smart TMJ...",
  "Home Dashboard": "لوحة الرئيسية",
  "Day Monitoring": "المراقبة النهارية",
  "Night Monitoring": "المراقبة الليلية",
  "TMJ Rehabilitation": "تأهيل المفصل الفكي",
  "Progress & Results": "التقدم والنتائج",
  "EXERCISE GUIDE": "دليل التمارين",
  "VIDEO RESOURCE CENTER": "مركز مصادر الفيديو",
  "Stop if pain increases or the jaw locks.": "توقف إذا زاد الألم أو حدث انغلاق بالفك.",
  "Connected": "متصل",
  "Disconnected": "غير متصل",
  "Battery": "البطارية",
  "Events": "الأحداث",
  "Total Time": "الوقت الإجمالي",
  "Peak Intensity": "أعلى شدة",
  "High": "مرتفع",
  "Moderate": "متوسط",
  "Mild": "خفيف",
  "Start Session": "ابدأ الجلسة",
  "Finish Session": "إنهاء الجلسة",
  "Duration": "المدة",
  "Pain Before": "الألم قبل",
  "Pain After": "الألم بعد",
  "Jaw Opening Before": "فتح الفم قبل",
  "Jaw Opening After": "فتح الفم بعد",
  "Patient Management": "إدارة المرضى",
  "Clinical Timeline": "السجل السريري",
  "Monitoring": "المراقبة",
  "Device Management": "إدارة الأجهزة",
  "AI Assistant": "مساعد الذكاء الاصطناعي",
  "Export PDF": "تصدير PDF",
  "No data available": "لا توجد بيانات متاحة",

  "Today's Overview":"ملخص اليوم",
  "View reports ›":"عرض التقارير ›",
  "Recorded events":"الأحداث المسجلة",
  "Exercise sessions":"جلسات التمارين",
  "Sensor status":"حالة الحساسات",
  "Masseter monitoring":"مراقبة العضلة الماضغة",
  "LEFT CHANNEL":"القناة اليسرى",
  "RIGHT CHANNEL":"القناة اليمنى",
  "Values are shown only when received from a connected sensor. No diagnosis is generated.":"تظهر القيم فقط عند استقبالها من حساس متصل. لا يتم إصدار تشخيص.",
  "Day & night":"النهار والليل",
  "Review clenching events and overnight activity when your sensor is connected.":"راجع أحداث انقباض الفك والنشاط الليلي عند توصيل الحساس.",
  "Guided jaw awareness and relaxation tasks.":"تمارين موجهة لزيادة الوعي بالفك والاسترخاء.",
  "All exercises ›":"كل التمارين ›",
  "GUIDED TMJ PROGRAM":"برنامج موجه للمفصل الفكي",
  "Move gently. Build better habits.":"تحرك برفق. اكتسب عادات أفضل.",
  "Jaw mobility, muscle relaxation and posture education.":"حركة الفك وإرخاء العضلات والتوعية بوضعية الجسم.",
  "Video Library":"مكتبة الفيديوهات",
  "Smart TMJ Pro provides educational and monitoring support. It does not diagnose medical conditions. Hardware readings require a compatible connected device.":"يوفر Smart TMJ Pro دعمًا تعليميًا ومساعدة في المراقبة، ولا يشخّص الحالات الطبية. تتطلب قراءات الأجهزة توصيل جهاز متوافق.",
  "Exercise Library":"مكتبة التمارين",
  "Explore your guided exercise collection":"استكشف مجموعة التمارين الموجهة",
  "Your recent practice":"تدريباتك الأخيرة",
  "This is a completed-session count, not adherence to a prescribed schedule. Your clinician can define an individual plan and target frequency.":"هذا عدد الجلسات المكتملة وليس مقياسًا للالتزام بجدول علاجي. يمكن للأخصائي تحديد خطة فردية ومعدل مناسب.",
  "Educational guide":"دليل تعليمي",
  "Safety reminder":"تذكير بالسلامة",
  "Try another search term or category.":"جرّب كلمة بحث أو تصنيفًا آخر.",
  "Clinical safety notice":"تنبيه للسلامة السريرية",
  "Open curated videos and clinical resources":"افتح فيديوهات مختارة ومصادر سريرية",
  "Session duration":"مدة الجلسة",
  "Practice comfortably":"تدرّب براحة",
  "Live Sensor Biofeedback":"التغذية الراجعة الحية من الحساسات",
  "PVDF sensor channels":"قنوات حساسات PVDF",
  "These are raw sensor units. They are not calibrated bite force, EMG, muscle activation, or a validated bruxism measurement.":"هذه وحدات خام للحساسات، وليست قياسًا معايرًا لقوة العض أو تخطيط العضلات أو نشاطها أو قياسًا معتمدًا لصرير الأسنان.",
  "Bilateral feedback":"التغذية الراجعة للجانبين",
  "Creates a shareable PDF for the selected reporting period. Review patient details before sharing.":"إنشاء تقرير PDF قابل للمشاركة للفترة المحددة. راجع بيانات المريض قبل المشاركة.",
  "Weekly Activity":"النشاط الأسبوعي",
  "Daily practice duration":"مدة التدريب اليومية",
  "Chart based on saved session durations.":"رسم بياني يعتمد على مدد الجلسات المحفوظة.",
  "Sensor Activity Trend":"اتجاه نشاط الحساسات",
  "Recorded sensor events · Last 7 days":"أحداث الحساسات المسجلة · آخر 7 أيام",
  "No sensor events are available in this monitoring session yet. Connect the hardware and use calibrated sensor settings to populate this chart.":"لا توجد أحداث حساسات متاحة في جلسة المراقبة حتى الآن. وصّل الأجهزة واستخدم إعدادات حساسات معايرة لعرض الرسم البياني.",
  "These are raw threshold-crossing activity segments, not a clinical Bruxism Index or diagnosis.":"هذه مقاطع نشاط خام تجاوزت العتبة المحددة، وليست مؤشرًا سريريًا معتمدًا لصرير الأسنان أو تشخيصًا.",
  "Rehabilitation Outcomes":"نتائج التأهيل",
  "Self-reported assessment trends":"اتجاهات التقييمات المبلغ عنها ذاتيًا",
  "Pain trends will appear after sessions include before-and-after scores.":"ستظهر اتجاهات الألم بعد تسجيل درجات قبل الجلسة وبعدها.",
  "Jaw opening trends require optional measured values before and after sessions.":"يتطلب عرض اتجاه فتح الفك إدخال قياسات اختيارية قبل الجلسات وبعدها.",
  "Smart Clinical Insights":"رؤى سريرية ذكية",
  "Rehabilitation tracking signals":"مؤشرات متابعة التأهيل",
  "Progress Summary":"ملخص التقدم",
  "Practice consistency":"انتظام التدريب",
  "Reference: 7 sessions per week, not a medical target.":"مرجع للمقارنة: 7 جلسات أسبوعيًا، وليس هدفًا طبيًا.",
  "Session History":"سجل الجلسات",
  "Your sessions will appear here after saving.":"ستظهر جلساتك هنا بعد حفظها.",
  "Data interpretation":"تفسير البيانات",
  "Device Center":"مركز الأجهزة",
  "Bluetooth Low Energy · Hardware integration":"بلوتوث منخفض الطاقة · تكامل الأجهزة",
  "Scanning nearby BLE peripherals…":"جارٍ البحث عن أجهزة BLE القريبة…",
  "Discovered BLE Devices":"أجهزة BLE المكتشفة",
  "No devices discovered yet. Turn on your hardware and start a scan.":"لم يتم اكتشاف أجهزة بعد. شغّل الجهاز وابدأ البحث.",
  "Firmware GATT Configuration":"إعدادات GATT للبرنامج الثابت",
  "Service UUID":"معرّف UUID للخدمة",
  "Notify Characteristic UUID":"معرّف UUID لخاصية الإشعارات",
  "Write Characteristic UUID (optional)":"معرّف UUID لخاصية الكتابة (اختياري)",
  "UUIDs are not guessed. Use the exact values defined by the firmware for each board.":"لا يتم تخمين معرّفات UUID. استخدم القيم الدقيقة المحددة في البرنامج الثابت لكل لوحة.",
  "Sensor Calibration & Event Detection":"معايرة الحساسات واكتشاف الأحداث",
  "Raw signal threshold":"عتبة الإشارة الخام",
  "Supported Hardware Families":"أنواع الأجهزة المدعومة",
  "Live Sensor Data":"بيانات الحساسات المباشرة",
  "Values appear only after the connected device sends valid notification payloads.":"تظهر القيم فقط بعد إرسال الجهاز المتصل بيانات إشعارات صحيحة.",
  "Nighttime dental sensor interface":"واجهة حساس الأسنان الليلي",
  "NOT CONNECTED":"غير متصل",
  "Device Status":"حالة الجهاز",
  "Night Routine":"الروتين الليلي",
  "Demo monitoring mode":"وضع المراقبة التجريبي",
  "DEMO MODE ENABLED":"الوضع التجريبي مفعّل",
  "Planned features":"الميزات المخطط لها",
  "Wearable clock interface":"واجهة الساعة القابلة للارتداء",
  "Heart rate":"معدل ضربات القلب",
  "Steps":"الخطوات",
  "Watch Connection":"اتصال الساعة",
  "Bluetooth status":"حالة البلوتوث",
  "Planned Watch Features":"ميزات الساعة المخطط لها",
  "Daytime awareness":"الوعي النهاري",
  "DAYTIME ROUTINE":"الروتين النهاري",
  "Relax your jaw during the day.":"أرخِ فكك خلال اليوم.",
  "Educational awareness and relaxation settings.":"إعدادات تعليمية لزيادة الوعي والاسترخاء.",
  "Reminder preference":"تفضيل التذكير",
  "Preference only; notifications are not scheduled yet.":"هذا تفضيل فقط؛ لم تتم جدولة الإشعارات بعد.",
  "Jaw awareness":"الوعي بوضع الفك",
  "Live Bilateral Signal Comparison":"مقارنة الإشارات الحية للجانبين",
  "Left / Right channels":"القنوات اليسرى / اليمنى",
  "Daily Tips":"نصائح يومية",
  "Keep your teeth apart when not eating.":"حافظ على تباعد الأسنان عندما لا تأكل.",
  "Maintain comfortable head and neck alignment.":"حافظ على وضع مريح ومتوازن للرأس والرقبة.",
  "Take a comfortable break when you notice tension.":"خذ استراحة مريحة عندما تشعر بالتوتر.",
  "Live jaw activity and recorded sensor events":"نشاط الفك المباشر وأحداث الحساسات المسجلة",
  "Sensor data status":"حالة بيانات الحساسات",
  "Jaw Sensor Channels":"قنوات حساسات الفك",
  "Recorded Activity":"النشاط المسجل",
  "Event detection calibration":"معايرة اكتشاف الأحداث",
  "Seven-Day Activity Trend":"اتجاه النشاط خلال سبعة أيام",
  "Recorded sensor events by day":"أحداث الحساسات المسجلة حسب اليوم",
  "The trend will appear after real sensor events have been recorded.":"سيظهر الاتجاه بعد تسجيل أحداث حقيقية من الحساسات.",
  "Recent Sensor Activity Events":"أحدث أحداث نشاط الحساسات",
  "No events have been recorded by the monitoring engine yet.":"لم يسجل محرك المراقبة أي أحداث حتى الآن.",
  "Sleep Analysis":"تحليل النوم",
  "TMJ educational assistant":"المساعد التعليمي للمفصل الفكي",
  "Suggested Questions":"أسئلة مقترحة",
  "Gemini AI · Uses available app context · Educational support, not a diagnosis":"Gemini AI · يستخدم سياق التطبيق المتاح · دعم تعليمي وليس تشخيصًا",
  "Your personal and clinical overview":"نظرة عامة شخصية وسريرية",
  "Modes & Devices":"الأوضاع والأجهزة",
  "Separate local records for each patient":"سجلات محلية منفصلة لكل مريض",
  "ACTIVE PATIENT":"المريض الحالي",
  "New patient":"مريض جديد",
  "Only enter information with the patient's consent. Records are stored locally on this device.":"أدخل البيانات بموافقة المريض فقط. تُخزّن السجلات محليًا على هذا الجهاز.",
  "Privacy & scope":"الخصوصية ونطاق الاستخدام",
  "New Symptom Check-in":"تسجيل عرض جديد",
  "Pain score · Optional (0–10)":"درجة الألم · اختياري (0–10)",
  "Notes · Optional":"ملاحظات · اختياري",
  "Timeline Filters":"مرشحات السجل الزمني",
  "No records yet. Save a symptom check-in or complete a session to begin your timeline.":"لا توجد سجلات بعد. احفظ تسجيلًا للأعراض أو أكمل جلسة لبدء السجل الزمني.",
  "Clinical interpretation":"التفسير السريري",
  "Manage your preferences":"إدارة تفضيلاتك",
  "Display Name":"الاسم المعروض",
  "Clinical diagnosis · Optional":"التشخيص السريري · اختياري",
  "Affected side":"الجانب المتأثر",
  "Treating clinician · Optional":"الأخصائي المعالج · اختياري",
  "Notifications":"الإشعارات",
  "Notification scheduling will be added in a future version.":"ستتم إضافة جدولة الإشعارات في إصدار مستقبلي.",
  "Treatment Preferences":"تفضيلات العلاج",
  "Exercise library: Available":"مكتبة التمارين: متاحة",
  "TMJ Video Library: Available":"مكتبة فيديوهات المفصل الفكي: متاحة",
  "Day mode: Available":"الوضع النهاري: متاح",
  "Night mode: Interface preview":"الوضع الليلي: معاينة للواجهة",
  "Local Data Storage":"تخزين البيانات محليًا"

};
let currentLanguage = 'en';
const translateText = value => {
  if (typeof value !== 'string' || currentLanguage !== 'ar') return value;
  if (translations[value]) return translations[value];
  return value.replace(/\b(Home|Monitor|Rehab|Progress|More|Night Mode|Day Mode|Exercises|Results|Profile|Devices|Videos|Patients|Beginner|Intermediate|Advanced|Relaxation|Jaw Mobility|Muscle Relaxation|Neck & Posture|Bruxism|High|Moderate|Mild|Connected|Disconnected)\b/g, word => translations[word] || word);
};
function Text({children,style,...props}) {
  const mapChild = child => {
    if (typeof child === 'string') return translateText(child);
    if (Array.isArray(child)) return child.map(mapChild);
    return child;
  };
  const rtl = currentLanguage === 'ar';
  return <RNText {...props} style={[style,rtl&&{writingDirection:'rtl',textAlign:'right'}]}>{mapChild(children)}</RNText>;
}
function TextInput(props) {
  const rtl = currentLanguage === 'ar';
  return <RNTextInput {...props}
    placeholder={translateText(props.placeholder)}
    style={[props.style,rtl&&{writingDirection:'rtl',textAlign:'right'}]}
  />;
}

const C = {
  bg:'#071522', white:'#102638', navy:'#F3FAFF', teal:'#19E6E0',
  mint:'#103D49', aqua:'#19CFC9', muted:'#9AB0C1', border:'#1C3A4B',
  soft:'#153346', red:'#F07570', orange:'#F5B75E', purple:'#A98AF2'
};

const KEY = '@smart_tmj_pro_v1';

const tabs = [
  {id:'Home',icon:'⌂',label:'Home'},
  {id:'Night Mode',icon:'◉',label:'Monitor'},
  {id:'Exercises',icon:'♧',label:'Rehab'},
  {id:'Results',icon:'▥',label:'Progress'},
  {id:'More',icon:'•••',label:'More'}
];

const defaultDevices = [
  {id:'guard',name:'Smart Night Guard',type:'Dental Sensor',connected:false,battery:92},
  {id:'watch',name:'Smart Watch',type:'Wearable Display',connected:false,battery:86}
];

const exerciseItems = [
  {
    id:'relax',title:'Relaxed Jaw Position',category:'Relaxation',
    duration:2,level:'Beginner',
    description:'Learn a comfortable resting position for your jaw.',
    instructions:[
      'Sit comfortably with your head in a neutral position.',
      'Rest your tongue gently behind your upper front teeth.',
      'Keep your teeth slightly apart.',
      'Allow your jaw muscles to relax.'
    ],
    query:'TMJ relaxed jaw position exercise',
    targetMuscles:['Masseter','Temporalis'],focus:'Resting jaw awareness',movement:'Relaxation / motor awareness',goal:'Practice a comfortable resting jaw position.'
  },
  {
    id:'opening',title:'Controlled Jaw Opening',category:'Jaw Mobility',
    duration:2,level:'Beginner',
    description:'Practice smooth and controlled jaw opening.',
    instructions:[
      'Sit in front of a mirror.',
      'Keep your tongue gently toward the roof of your mouth.',
      'Open your mouth slowly and comfortably.',
      'Close smoothly without forcing movement.'
    ],
    query:'TMJ controlled jaw opening exercise',
    targetMuscles:['Suprahyoid group','Jaw depressors'],focus:'Controlled opening coordination',movement:'Jaw opening',goal:'Practice smooth, comfortable opening and closing.'
  },
  {
    id:'side',title:'Side-to-Side Jaw Movement',category:'Jaw Mobility',
    duration:2,level:'Intermediate',
    description:'Practice comfortable lateral jaw movement.',
    instructions:[
      'Start with your jaw relaxed.',
      'Move your jaw gently to one side.',
      'Return to the center.',
      'Repeat toward the opposite side only within a comfortable range.'
    ],
    query:'TMJ lateral jaw movement exercise',
    targetMuscles:['Lateral pterygoid','Jaw stabilizers'],focus:'Lateral movement coordination',movement:'Jaw lateral excursion',goal:'Practice gentle side-to-side control within a comfortable range.'
  },
  {
    id:'massage',title:'Masseter Muscle Massage',category:'Muscle Relaxation',
    duration:3,level:'Beginner',
    description:'Gentle self-massage education for the masseter muscle.',
    instructions:[
      'Locate the masseter muscle over the side of your jaw.',
      'Use gentle circular movements.',
      'Avoid deep or painful pressure.',
      'Stop if symptoms increase.'
    ],
    query:'masseter muscle massage TMJ',
    targetMuscles:['Masseter'],focus:'Gentle muscle relaxation',movement:'Soft-tissue self-massage',goal:'Develop awareness of the masseter region using light, comfortable contact.'
  },
  {
    id:'temporal',title:'Temporalis Relaxation',category:'Muscle Relaxation',
    duration:2,level:'Beginner',
    description:'Gentle relaxation for the temporalis region.',
    instructions:[
      'Place your fingertips gently over the temple region.',
      'Use small comfortable circular movements.',
      'Avoid pressing firmly.',
      'Stop if you experience pain.'
    ],
    query:'temporalis muscle massage TMJ',
    targetMuscles:['Temporalis'],focus:'Gentle muscle relaxation',movement:'Soft-tissue self-massage',goal:'Develop awareness of the temporalis region using light, comfortable contact.'
  },
  {
    id:'posture',title:'Neck & Posture Exercises',category:'Neck & Posture',
    duration:3,level:'Beginner',
    description:'Improve awareness of comfortable head and neck posture.',
    instructions:[
      'Sit with your shoulders relaxed.',
      'Keep your head aligned comfortably.',
      'Avoid pushing your neck into an uncomfortable position.',
      'Practice gentle posture awareness.'
    ],
    query:'neck posture exercises TMJ',
    targetMuscles:['Deep cervical flexors','Cervical extensors','Scapular stabilizers'],focus:'Cervical and postural awareness',movement:'Postural control',goal:'Practice comfortable head, neck and shoulder alignment.'
  },
  {
    id:'protrusion',title:'Gentle Jaw Protrusion',category:'Jaw Mobility',
    duration:2,level:'Advanced',
    description:'Educational guide to controlled forward jaw movement.',
    instructions:[
      'Start in a relaxed jaw position.',
      'Move your lower jaw slightly forward only if comfortable.',
      'Return slowly to the starting position.',
      'Do not force the movement.'
    ],
    query:'TMJ protrusion exercise',
    targetMuscles:['Lateral pterygoid','Jaw stabilizers'],focus:'Controlled protrusion',movement:'Jaw protrusion',goal:'Explore a small, comfortable forward movement only when appropriate.'
  },
  {
    id:'breathing',title:'Relaxation Breathing',category:'Relaxation',
    duration:3,level:'Beginner',
    description:'A calm breathing routine to support general relaxation.',
    instructions:[
      'Sit comfortably.',
      'Breathe in slowly through your nose.',
      'Breathe out gently.',
      'Continue without straining.'
    ],
    query:'relaxation breathing exercise',
    targetMuscles:['Diaphragm','Respiratory muscles'],focus:'General relaxation',movement:'Breathing control',goal:'Practice calm, unforced breathing.'
  }
];

const categories = [
  'All','Relaxation','Jaw Mobility','Muscle Relaxation','Neck & Posture'
];

// VERIFIED VIDEO AND EDUCATIONAL RESOURCE LINKS
const videoItems = [
  {
    id:'v1',
    title:'Jaw Relaxation Exercises',
    category:'Relaxation',
    description:'Jaw relaxation exercises and comfortable resting-position guidance.',
    source:'Clinicol TMJ exercise handout',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=8wFSeYB9pN8'
  },
  {
    id:'v2',
    title:'Jaw Movement Exercises',
    category:'Jaw Mobility',
    description:'Guided jaw movement exercises for temporomandibular disorders.',
    source:'Clinicol TMJ exercise handout',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=vWLGF34qi3g'
  },
  {
    id:'v3',
    title:'TMJ Exercises – Phase 1',
    category:'Jaw Mobility',
    description:'TMJ Exercises #1 – introductory jaw pain and teeth-grinding exercise routine.',
    source:'Clinicol TMJ exercise handout',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=EM18snVgV_c'
  },
  {
    id:'v4',
    title:'TMJ Exercises – Phase 2',
    category:'Jaw Mobility',
    description:'TMJ Exercises #2 – follow-along jaw pain and teeth-grinding routine.',
    source:'Clinicol TMJ exercise handout',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=MS4O2dbCJc8'
  },
  {
    id:'v5',
    title:'TMJ Massage Techniques',
    category:'Muscle Relaxation',
    description:'TMJ massage techniques and soft-tissue self-care demonstration.',
    source:'Clinicol TMJ exercise handout',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=o_mHqmmUgM8'
  },
  {
    id:'v6',
    title:'Masseter Self-Massage',
    category:'Muscle Relaxation',
    description:'Clinical guide to masseter overload, self-massage, stretching and jaw relaxation.',
    source:'PT Sakkinen – clinical video guide',
    type:'Clinical video page',
    url:'https://www.ptsakkinen.com/videos/t8iCnAUr4pU'
  },
  {
    id:'v7',
    title:'Stiff Jaw & Masseter Education',
    category:'Muscle Relaxation',
    description:'Guide to morning jaw stiffness, TMJ mobility and masseter, temporalis and pterygoid self-care.',
    source:'PT Sakkinen – clinical video guide',
    type:'Clinical video page',
    url:'https://www.ptsakkinen.com/videos/pgviiSR2Qks'
  },
  {
    id:'v8',
    title:'Neck & Posture – TMJ Resources',
    category:'Neck & Posture',
    description:'Explore educational resources about posture and TMD.',
    type:'NHS educational resource',
    url:'https://www.nhs.uk/conditions/temporomandibular-disorder-tmd/'
  },
  {
    id:'v9',
    title:'Rocabado 6×6 – Educational Search',
    category:'Rocabado',
    description:'Find educational demonstrations of the Rocabado 6×6 program. Follow clinician guidance.',
    type:'YouTube educational search',
    url:'https://www.youtube.com/results?search_query=Rocabado+6x6+TMJ+exercises'
  },
  {
    id:'v10',
    title:'Bruxism – Patient Education',
    category:'Bruxism',
    description:'Educational information about teeth grinding and clenching.',
    type:'NHS educational resource',
    url:'https://www.nhs.uk/conditions/teeth-grinding/'
  },
  {
    id:'v11',
    title:'TMJ Anatomy & Biomechanics',
    category:'TMJ Education',
    description:'Educational videos about TMJ anatomy and joint movement.',
    type:'YouTube educational search',
    url:'https://www.youtube.com/results?search_query=TMJ+anatomy+biomechanics'
  },
  {
    id:'v12',
    title:'Disc Displacement – TMJ Education',
    category:'TMJ Education',
    description:'Educational videos explaining disc displacement.',
    type:'YouTube educational search',
    url:'https://www.youtube.com/results?search_query=TMJ+disc+displacement+explained'
  },
  {
    id:'v13',
    title:'Thermal Modalities & TMJ',
    category:'Pain Management',
    description:'Educational information about heat and cold applications.',
    type:'YouTube educational search',
    url:'https://www.youtube.com/results?search_query=TMJ+heat+cold+therapy+education'
  },
  {
    id:'v14',
    title:'Newcastle NHS TMD Video Playlist',
    category:'Clinical Resources',
    description:'NHS Newcastle educational playlist covering TMD self-physiotherapy, jaw exercises, thermal modalities and facial massage.',
    source:'Newcastle Hospitals NHS Foundation Trust',
    type:'NHS video playlist',
    url:'https://www.youtube.com/playlist?list=PL0Zkwya_9eK9dUJbeyARqIxupd8i53EbJ'
  }
];

const videoCategories = [
  'All',
  'Relaxation',
  'Jaw Mobility',
  'Muscle Relaxation',
  'Neck & Posture',
  'Rocabado',
  'Bruxism',
  'TMJ Education',
  'Pain Management',
  'Clinical Resources'
];

async function openExternal(url) {
  try {
    const safeUrl = String(url || '').trim();
    if (!/^https?:\/\//i.test(safeUrl)) {
      Alert.alert('Invalid link', 'This link is not valid.');
      return;
    }
    await Linking.openURL(safeUrl);
  } catch (e) {
    Alert.alert('Unable to open link','Please try again or open the link manually.');
  }
}

function Card({children,style}) {
  return <View style={[s.card,style]}>{children}</View>;
}

function Heading({children}) {
  return <Text style={s.heading}>{children}</Text>;
}

function Section({children}) {
  return <Text style={s.section}>{children}</Text>;
}

function Tag({children,color=C.mint}) {
  return (
    <View style={[s.tag,{backgroundColor:color}]}>
      <Text style={s.tagText}>{children}</Text>
    </View>
  );
}

function Btn({title,onPress,secondary,danger,disabled=false}) {
  return (
    <TouchableOpacity
      activeOpacity={disabled?1:0.8}
      disabled={disabled}
      onPress={onPress}
      style={[s.button,secondary&&s.secondary,danger&&s.danger,disabled&&{opacity:0.55}]}
    >
      <Text style={[s.buttonText,secondary&&{color:C.navy}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Metric({value,label,color=C.teal}) {
  return (
    <Card style={s.metric}>
      <Text style={[s.metricValue,{color}]}>{value}</Text>
      <Text style={s.small}>{label}</Text>
    </Card>
  );
}

function Bar({value,max=100,color=C.teal}) {
  return (
    <View style={s.barTrack}>
      <View style={[
        s.barFill,
        {
          width:Math.max(0,Math.min(100,max?value/max*100:0))+'%',
          backgroundColor:color
        }
      ]}/>
    </View>
  );
}

// HOME

function HomeScreen({sessions,setPage,devices,profile}) {
  const monitor = useSensorMonitor();
  const events = Array.isArray(monitor.events) ? monitor.events : [];
  const readings = monitor.readings || {};
  const deviceConnected = Array.isArray(devices) && devices.some(device => device.connected);
  const eventCount = events.length;
  const latestValues = Object.values(readings).filter(value => value !== null && value !== undefined);
  const hasReadings = latestValues.some(item => item && Number.isFinite(Number(item.timestamp)) && Date.now() - Number(item.timestamp) < 30000);
  const todaySessions = Array.isArray(sessions) ? sessions : [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.homeContent}>
      <View style={s.homeTopRow}>
        <View style={{flex:1}}>
          <Text style={s.homeEyebrow}>TMJ PHYSIOTHERAPY & BRUXISM CARE</Text>
          <Text style={s.homeWelcome}>Welcome{profile && profile.name ? ', ' + profile.name : ''}</Text>
          <Text style={s.homeSubheading}>Your jaw health at a glance</Text>
        </View>
        <TouchableOpacity style={s.homeAvatar} onPress={() => setPage('Profile')} accessibilityLabel="Open profile">
          <Text style={s.homeAvatarText}>{profile && profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'U'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} style={s.deviceHero} onPress={() => setPage('Devices')}>
        <View style={s.deviceHeroCopy}>
          <Text style={s.deviceHeroKicker}>SMART NIGHT GUARD</Text>
          <Text style={s.deviceHeroTitle}>{deviceConnected ? 'Device connected' : 'Connect your device'}</Text>
          <Text style={s.deviceHeroBody}>{deviceConnected ? 'Your wearable connection is active.' : 'Pair your Night Guard or Smart Watch to begin live monitoring.'}</Text>
          <View style={s.deviceStatusPill}>
            <View style={[s.statusDot, deviceConnected ? s.statusDotOn : s.statusDotOff]} />
            <Text style={s.deviceStatusText}>{deviceConnected ? 'CONNECTED' : 'NOT CONNECTED'}</Text>
          </View>
        </View>
        <View style={s.deviceIllustration}>
          <Text style={s.deviceIllustrationIcon}>⌁</Text>
          <Text style={s.deviceIllustrationLabel}>BLE</Text>
        </View>
      </TouchableOpacity>

      <View style={s.sectionHeadingRow}>
        <Text style={s.homeSectionTitle}>Today's Overview</Text>
        <TouchableOpacity onPress={() => setPage('Results')}><Text style={s.homeAction}>View reports ›</Text></TouchableOpacity>
      </View>
      <View style={s.homeMetricsRow}>
        <View style={s.homeMetricCard}>
          <Text style={s.homeMetricIcon}>⌁</Text>
          <Text style={s.homeMetricValue}>{eventCount}</Text>
          <Text style={s.homeMetricLabel}>Recorded events</Text>
        </View>
        <View style={s.homeMetricCard}>
          <Text style={s.homeMetricIcon}>◷</Text>
          <Text style={s.homeMetricValue}>{todaySessions.length}</Text>
          <Text style={s.homeMetricLabel}>Exercise sessions</Text>
        </View>
        <View style={s.homeMetricCard}>
          <Text style={s.homeMetricIcon}>◉</Text>
          <Text style={[s.homeMetricValue,{fontSize:15}]}>{hasReadings ? 'Live' : '—'}</Text>
          <Text style={s.homeMetricLabel}>Sensor status</Text>
        </View>
      </View>

      <View style={s.sectionHeadingRow}>
        <Text style={s.homeSectionTitle}>Jaw Activity</Text>
        <Text style={s.homeMuted}>{hasReadings ? 'Latest sensor data' : 'Waiting for sensor data'}</Text>
      </View>
      <View style={s.jawActivityCard}>
        <View style={s.jawActivityHeader}>
          <Text style={s.jawActivityTitle}>Masseter monitoring</Text>
          <View style={s.liveBadge}><View style={s.statusDot}/><Text style={s.liveBadgeText}>{hasReadings ? 'DATA RECEIVED' : 'NO LIVE DATA'}</Text></View>
        </View>
        <View style={s.jawSidesRow}>
          <View style={s.jawSide}>
            <Text style={s.jawSideValue}>{readings.left && typeof readings.left.value === 'number' ? String(readings.left.value) : '—'}</Text>
            <Text style={s.jawSideLabel}>LEFT CHANNEL</Text>
          </View>
          <View style={s.jawCenter}>
            <Text style={s.jawCenterIcon}>◉</Text>
            <Text style={s.jawCenterLabel}>TMJ</Text>
          </View>
          <View style={s.jawSide}>
            <Text style={s.jawSideValue}>{readings.right && typeof readings.right.value === 'number' ? String(readings.right.value) : '—'}</Text>
            <Text style={s.jawSideLabel}>RIGHT CHANNEL</Text>
          </View>
        </View>
        <Text style={s.jawFootnote}>Values are shown only when received from a connected sensor. No diagnosis is generated.</Text>
        <Btn title="Open live monitoring" onPress={() => setPage('Night Mode')}/>
      </View>

      <View style={s.sectionHeadingRow}>
        <Text style={s.homeSectionTitle}>Monitoring</Text>
        <Text style={s.homeMuted}>Day & night</Text>
      </View>
      <TouchableOpacity style={s.featureCard} onPress={() => setPage('Night Mode')}>
        <View style={s.featureIcon}><Text style={s.featureIconText}>☾</Text></View>
        <View style={s.featureCopy}><Text style={s.featureTitle}>Night Monitoring</Text><Text style={s.featureBody}>Review clenching events and overnight activity when your sensor is connected.</Text></View>
        <Text style={s.featureArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.featureCard} onPress={() => setPage('Day Mode')}>
        <View style={s.featureIcon}><Text style={s.featureIconText}>☼</Text></View>
        <View style={s.featureCopy}><Text style={s.featureTitle}>Daytime Assessment</Text><Text style={s.featureBody}>Guided jaw awareness and relaxation tasks.</Text></View>
        <Text style={s.featureArrow}>›</Text>
      </TouchableOpacity>

      <View style={s.sectionHeadingRow}>
        <Text style={s.homeSectionTitle}>Rehabilitation</Text>
        <TouchableOpacity onPress={() => setPage('Exercises')}><Text style={s.homeAction}>All exercises ›</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={s.rehabBanner} onPress={() => setPage('Exercises')}>
        <View style={{flex:1}}>
          <Text style={s.rehabKicker}>GUIDED TMJ PROGRAM</Text>
          <Text style={s.rehabTitle}>Move gently. Build better habits.</Text>
          <Text style={s.rehabBody}>Jaw mobility, muscle relaxation and posture education.</Text>
        </View>
        <Text style={s.rehabIcon}>✦</Text>
      </TouchableOpacity>
      <View style={s.shortcutGrid}>
        <TouchableOpacity style={s.shortcutCard} onPress={() => setPage('Night Guard')}><Text style={s.shortcutIcon}>⌁</Text><Text style={s.shortcutTitle}>Night Guard</Text></TouchableOpacity>
        <TouchableOpacity style={s.shortcutCard} onPress={() => setPage('Smart Watch')}><Text style={s.shortcutIcon}>◷</Text><Text style={s.shortcutTitle}>Smart Watch</Text></TouchableOpacity>
        <TouchableOpacity style={s.shortcutCard} onPress={() => setPage('Videos')}><Text style={s.shortcutIcon}>▷</Text><Text style={s.shortcutTitle}>Video Library</Text></TouchableOpacity>
        <TouchableOpacity style={s.shortcutCard} onPress={() => setPage('AI')}><Text style={s.shortcutIcon}>✧</Text><Text style={s.shortcutTitle}>AI Assistant</Text></TouchableOpacity>
      </View>
      <View style={s.homeDisclaimer}><Text style={s.homeDisclaimerText}>Smart TMJ Pro provides educational and monitoring support. It does not diagnose medical conditions. Hardware readings require a compatible connected device.</Text></View>
    </ScrollView>
  );
}
// EXERCISES

function ExercisesScreen({setPage,sessions}) {
  const [category,setCategory]=useState('All');
  const [search,setSearch]=useState('');

  const filtered=exerciseItems.filter(item=>
    (category==='All'||item.category===category) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  const weekStart = Date.now() - 7 * 86400000;
  const recentSessions = (Array.isArray(sessions) ? sessions : []).filter(item =>
    Number(item.timestamp) >= weekStart && Number(item.timestamp) <= Date.now()
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Exercise Library</Heading>
      <Text style={s.subtitle}>Explore your guided exercise collection</Text>

      <Btn title="Open TMJ Video Library" onPress={()=>setPage('Videos')}/>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises..."
        style={s.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={s.categoryRow}>
          {categories.map(x=>(
            <TouchableOpacity
              key={x}
              onPress={()=>setCategory(x)}
              style={[s.category,category===x&&s.categoryActive]}
            >
              <Text style={[s.categoryText,category===x&&{color:C.white}]}>{x}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Section>Exercise Intelligence</Section>
      <Card>
        <Text style={s.cardTitle}>Your recent practice</Text>
        <Text style={s.body}>{recentSessions.length} completed session(s) recorded in the last 7 days.</Text>
        <Text style={s.small}>This is a completed-session count, not adherence to a prescribed schedule. Your clinician can define an individual plan and target frequency.</Text>
      </Card>

      <Section>{filtered.length} Exercises</Section>

      {filtered.map(item=>{
        const completedCount = recentSessions.filter(session=>session.exerciseId===item.id).length;
        return (
        <Card key={item.id}>
          <View style={s.between}>
            <Tag>{item.category}</Tag>
            <Text style={s.small}>{item.duration} min</Text>
          </View>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.body}>{item.description}</Text>
          <Text style={s.small}>Focus: {item.focus}</Text>
          <Text style={s.small}>Target muscle groups: {item.targetMuscles.join(' · ')}</Text>
          <Text style={s.small}>Movement: {item.movement}</Text>
          <Text style={s.small}>Completed in last 7 days: {completedCount}</Text>
          <View style={s.between}>
            <Tag color={C.soft}>{item.level}</Tag>
            <Text style={s.small}>Educational guide</Text>
          </View>
          <Btn title="View Exercise Guide" secondary onPress={()=>setPage('exercise:'+item.id)}/>
        </Card>
        );
      })}


      <Card>
        <Text style={s.cardTitle}>Safety reminder</Text>
        <Text style={s.body}>
          Exercise suitability depends on the individual diagnosis.
          Avoid painful or forced movements and follow your clinician's instructions.
        </Text>
      </Card>
    </ScrollView>
  );
}

// TMJ VIDEO LIBRARY

function VideosScreen() {
  const [category,setCategory]=useState('All');
  const [search,setSearch]=useState('');

  const filtered=videoItems.filter(item=>{
    const matchesCategory=category==='All'||item.category===category;
    const q=search.toLowerCase();
    const matchesSearch=
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesCategory&&matchesSearch;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>TMJ Video Library</Heading>
      <Text style={s.subtitle}>
        Educational videos and clinical resources
      </Text>

      <Card style={s.hero}>
        <Tag>VIDEO RESOURCE CENTER</Tag>
        <Text style={s.heroTitle}>Learn. Practice. Understand.</Text>
        <Text style={s.body}>
          Explore jaw mobility, relaxation, massage, posture, bruxism
          and TMJ educational resources.
        </Text>
      </Card>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search videos or topics..."
        style={s.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={s.categoryRow}>
          {videoCategories.map(x=>(
            <TouchableOpacity
              key={x}
              onPress={()=>setCategory(x)}
              style={[s.category,category===x&&s.categoryActive]}
            >
              <Text style={[s.categoryText,category===x&&{color:C.white}]}>
                {x}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Section>{filtered.length} Resources</Section>

      {filtered.map(item=>(
        <Card key={item.id}>
          <View style={s.videoThumb}>
            <Text style={s.playIcon}>▶</Text>
            <Text style={s.videoThumbText}>TMJ VIDEO RESOURCE</Text>
          </View>

          <View style={[s.between,{marginTop:12}]}>
            <Tag>{item.category}</Tag>
            <Tag color={C.soft}>{item.type}</Tag>
          </View>

          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.body}>{item.description}</Text>
          {item.source&&<Text style={s.small}>Source: {item.source}</Text>}

          <Btn
            title="Open Video / Resource"
            onPress={()=>openExternal(item.url)}
          />
        </Card>
      ))}

      {filtered.length===0&&(
        <Card>
          <Text style={s.cardTitle}>No results found</Text>
          <Text style={s.body}>Try another search term or category.</Text>
        </Card>
      )}

      <Card>
        <Text style={s.cardTitle}>Clinical safety notice</Text>
        <Text style={s.body}>
          These are educational resources, not individualized treatment plans.
          Not every exercise is appropriate for every TMJ condition.
          Avoid forced or painful movement and consult a qualified clinician
          when symptoms persist or worsen.
        </Text>
      </Card>
    </ScrollView>
  );
}

// EXERCISE DETAILS

function ExerciseDetails({item,setPage}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>{item.title}</Heading>
      <Text style={s.subtitle}>{item.category} · {item.level}</Text>

      <Card style={s.hero}>
        <Tag>EXERCISE GUIDE</Tag>
        <Text style={s.heroTitle}>{item.title}</Text>
        <Text style={s.body}>{item.description}</Text>
        <Text style={s.cardTitle}>Rehabilitation focus</Text>
        <Text style={s.body}>{item.focus}</Text>
        <Text style={s.cardTitle}>Relevant muscle groups</Text>
        <Text style={s.body}>{item.targetMuscles.join(' · ')}</Text>
        <Text style={s.cardTitle}>Movement category</Text>
        <Text style={s.body}>{item.movement}</Text>
        <Text style={s.cardTitle}>Suggested duration</Text>
        <Text style={s.body}>{item.duration} minutes</Text>
      </Card>

      <Section>Instructions</Section>
      <Card>
        {item.instructions.map((x,i)=>(
          <View key={i} style={s.step}>
            <View style={s.stepCircle}>
              <Text style={s.stepText}>{i+1}</Text>
            </View>
            <Text style={[s.body,{flex:1,marginTop:0}]}>{x}</Text>
          </View>
        ))}
      </Card>

      <Section>Video Resource</Section>
      <Card>
        <View style={s.videoBox}>
          <Text style={{fontSize:35,color:C.teal}}>▶</Text>
          <Text style={s.cardTitle}>TMJ Video Library</Text>
          <Text style={s.small}>Open curated videos and clinical resources</Text>
        </View>
        <Btn title="Open TMJ Video Library" onPress={()=>setPage('Videos')}/>
        <Btn
          title="Search this topic on YouTube"
          secondary
          onPress={()=>openExternal(
            'https://www.youtube.com/results?search_query='+encodeURIComponent(item.query)
          )}
        />
      </Card>

      <Card>
        <Text style={s.cardTitle}>Clinical Safety</Text>
        <Text style={s.body}>
          This guide is educational and not a personalized treatment prescription.
          Stop if pain increases or the jaw locks.
        </Text>
      </Card>

      <Btn title="Start this exercise" onPress={()=>setPage('Session:'+item.id)}/>
      <Btn title="Back to library" secondary onPress={()=>setPage('Exercises')}/>
    </ScrollView>
  );
}

// ACTIVE SESSION

function SessionScreen({finish,exercise,monitor}) {
  const [seconds,setSeconds]=useState(0);
  const [running,setRunning]=useState(false);
  const [painBefore,setPainBefore]=useState('');
  const [painAfter,setPainAfter]=useState('');
  const [jawOpeningBefore,setJawOpeningBefore]=useState('');
  const [jawOpeningAfter,setJawOpeningAfter]=useState('');

  useEffect(()=>{
    if(!running)return;
    const timer=setInterval(()=>setSeconds(x=>x+1),1000);
    return ()=>clearInterval(timer);
  },[running]);

  const time=
    String(Math.floor(seconds/60)).padStart(2,'0')+':'+
    String(seconds%60).padStart(2,'0');

  return (
    <ScrollView>
      <Heading>Active Session</Heading>
      <Text style={s.subtitle}>{exercise?exercise.title:'General practice session'}</Text>

      <Card style={s.center}>
        <Tag color={running?C.mint:'#FFF0DF'}>
          {running?'SESSION ACTIVE':'SESSION READY'}
        </Tag>
        <Text style={s.timer}>{time}</Text>
        <Text style={s.small}>Session duration</Text>
        <Btn title={running?'Pause':'Start / Resume'} onPress={()=>setRunning(!running)}/>
        <Btn
          title="Finish and save"
          secondary
          onPress={()=>{
            const numeric = value => value.trim()==='' ? null : Number(value);
            const values = [painBefore,painAfter].map(numeric);
            const openings = [jawOpeningBefore,jawOpeningAfter].map(numeric);
            if (values.some(value => value===null || !Number.isFinite(value) || value<0 || value>10)) {
              Alert.alert('Pain score required','Enter pain scores from 0 to 10 before saving.');
              return;
            }
            if (openings.some(value => value!==null && (!Number.isFinite(value) || value<0 || value>100))) {
              Alert.alert('Jaw opening value','Enter a valid measurement in millimeters (0–100), or leave both fields blank.');
              return;
            }
            setRunning(false);
            finish(seconds,exercise?exercise.title:'General practice',{
              painBefore:values[0],
              painAfter:values[1],
              jawOpeningBefore:openings[0],
              jawOpeningAfter:openings[1],
              exerciseId:exercise ? exercise.id : null,
              focus:exercise ? exercise.focus : 'General practice',
              targetMuscles:exercise ? exercise.targetMuscles : [],
              movement:exercise ? exercise.movement : 'Unspecified',
            });
          }}
        />
      </Card>

      <Section>Session Assessment</Section>
      <Card>
        <Text style={s.cardTitle}>Pain score (0–10)</Text>
        <Text style={s.body}>Record the user's self-reported pain before and after practice.</Text>
        <Text style={s.small}>Before session</Text>
        <TextInput value={painBefore} onChangeText={setPainBefore} keyboardType="number-pad" style={s.input} placeholder="0–10" placeholderTextColor={C.muted}/>
        <Text style={s.small}>After session</Text>
        <TextInput value={painAfter} onChangeText={setPainAfter} keyboardType="number-pad" style={s.input} placeholder="0–10" placeholderTextColor={C.muted}/>
      </Card>
      <Card>
        <Text style={s.cardTitle}>Jaw opening (mm) · Optional</Text>
        <Text style={s.body}>Enter a measured opening distance only if it was assessed using a consistent method. Do not force the jaw to obtain a larger value.</Text>
        <Text style={s.small}>Before session</Text>
        <TextInput value={jawOpeningBefore} onChangeText={setJawOpeningBefore} keyboardType="decimal-pad" style={s.input} placeholder="Millimeters" placeholderTextColor={C.muted}/>
        <Text style={s.small}>After session</Text>
        <TextInput value={jawOpeningAfter} onChangeText={setJawOpeningAfter} keyboardType="decimal-pad" style={s.input} placeholder="Millimeters" placeholderTextColor={C.muted}/>
      </Card>

      <Section>Session Guidance</Section>
      <Card>
        <Text style={s.cardTitle}>Practice comfortably</Text>
        <Text style={s.body}>
          Keep your movement gentle. Do not force your jaw or continue through pain.
        </Text>
      </Card>

      <Section>Live Sensor Biofeedback</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>PVDF sensor channels</Text>
          <Tag color={monitor&&monitor.receivedAt&&Date.now()-monitor.receivedAt<30000?C.mint:C.soft}>
            {monitor&&monitor.receivedAt&&Date.now()-monitor.receivedAt<30000?'LIVE DATA':'WAITING FOR HARDWARE'}
          </Tag>
        </View>
        <View style={s.row}>
          <Metric value={monitor?.readings?.left&&Number.isFinite(Number(monitor.readings.left.value))?String(monitor.readings.left.value):'—'} label="Left raw signal"/>
          <Metric value={monitor?.readings?.right&&Number.isFinite(Number(monitor.readings.right.value))?String(monitor.readings.right.value):'—'} label="Right raw signal"/>
        </View>
        <Text style={s.body}>Recorded threshold events: {Array.isArray(monitor?.events)?monitor.events.length:0}</Text>
        <Text style={s.small}>These are raw sensor units. They are not calibrated bite force, EMG, muscle activation, or a validated bruxism measurement.</Text>
      </Card>

      <Card>
        <Text style={s.cardTitle}>Bilateral feedback</Text>
        <Text style={s.body}>
          {monitor?.readings?.left&&monitor?.readings?.right
            ? 'Both sensor channels have readings available. Compare them only after sensor placement and calibration are verified.'
            : 'Connect and calibrate both PVDF channels to enable bilateral signal comparison. No simulated pressure or force values are displayed.'}
        </Text>
      </Card>
    </ScrollView>
  );
}

// REPORT EXPORT HELPERS

function escapeReportHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[character]));
}

function buildPatientReportHtml({sessions,clinicalEntries,monitoringEvents,profile,period}) {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - (period === 'Week' ? 7 : 30) * 86400000);
  const recent = (Array.isArray(sessions) ? sessions : []).filter(item => {
    const date = new Date(item.timestamp || item.date);
    return !isNaN(date.getTime()) && date >= rangeStart && date <= now;
  }).sort((x,y)=>Number(x.timestamp||0)-Number(y.timestamp||0));
  const totalSeconds = recent.reduce((sum,item)=>sum+Math.max(0,Number(item.duration)||0),0);
  const assessed = recent.filter(item=>item.assessment && Number.isFinite(Number(item.assessment.painBefore)) && Number.isFinite(Number(item.assessment.painAfter)));
  const measured = recent.filter(item=>item.assessment && item.assessment.jawOpeningBefore !== null && item.assessment.jawOpeningAfter !== null && Number.isFinite(Number(item.assessment.jawOpeningBefore)) && Number.isFinite(Number(item.assessment.jawOpeningAfter)));
  const avgPainChange = assessed.length ? assessed.reduce((sum,item)=>sum+Number(item.assessment.painBefore)-Number(item.assessment.painAfter),0)/assessed.length : null;
  const avgOpeningChange = measured.length ? measured.reduce((sum,item)=>sum+Number(item.assessment.jawOpeningAfter)-Number(item.assessment.jawOpeningBefore),0)/measured.length : null;
  const exerciseCounts = recent.reduce((map,item)=>{
    const key=item.exercise||'General practice';
    map[key]=(map[key]||0)+1;
    return map;
  },{});
  const sessionRows = recent.map(item=>{
    const assessment=item.assessment||{};
    return '<tr><td>'+escapeReportHtml(new Date(item.timestamp||item.date).toLocaleString())+'</td><td>'+escapeReportHtml(item.exercise||'Practice Session')+'</td><td>'+Math.floor((Number(item.duration)||0)/60)+'m '+((Number(item.duration)||0)%60)+'s</td><td>'+escapeReportHtml(assessment.painBefore ?? '—')+' → '+escapeReportHtml(assessment.painAfter ?? '—')+'</td><td>'+escapeReportHtml(assessment.jawOpeningBefore ?? '—')+' → '+escapeReportHtml(assessment.jawOpeningAfter ?? '—')+'</td></tr>';
  }).join('');
  const exerciseRows = Object.entries(exerciseCounts).sort((x,y)=>y[1]-x[1]).map(([name,count])=>'<li>'+escapeReportHtml(name)+': '+count+' session(s)</li>').join('');
  const checkIns = (Array.isArray(clinicalEntries)?clinicalEntries:[]).filter(item=>{
    const date=new Date(item.timestamp);
    return !isNaN(date.getTime())&&date>=rangeStart&&date<=now;
  }).sort((x,y)=>Number(x.timestamp)-Number(y.timestamp));
  const checkInRows = checkIns.map(item=>'<tr><td>'+escapeReportHtml(new Date(item.timestamp).toLocaleString())+'</td><td>'+escapeReportHtml(item.symptom||'Symptom')+'</td><td>'+escapeReportHtml(item.pain ?? '—')+'</td><td>'+escapeReportHtml(item.note||'—')+'</td></tr>').join('');
  const eventCount = (Array.isArray(monitoringEvents)?monitoringEvents:[]).filter(event=>{
    const date=new Date(event.startTime);
    return !isNaN(date.getTime())&&date>=rangeStart&&date<=now;
  }).length;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body{font-family:Arial,sans-serif;color:#172b3a;padding:28px;line-height:1.5}
    h1{color:#087f83;margin-bottom:4px}h2{color:#087f83;margin-top:24px}
    .muted{color:#647887;font-size:12px}.grid{display:flex;gap:12px;flex-wrap:wrap}
    .metric{border:1px solid #d7e2e8;border-radius:8px;padding:12px;min-width:110px;flex:1}
    .value{font-size:22px;font-weight:bold}.metric small{color:#647887}
    table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d7e2e8;padding:7px;text-align:left}th{background:#edf5f7}
    .notice{background:#f1f6f8;padding:12px;border-radius:8px;font-size:11px}
    </style></head><body>
    <h1>Smart TMJ Pro</h1><div class="muted">Patient & Therapist Practice Report · ${escapeReportHtml(period)} view · Generated ${escapeReportHtml(now.toLocaleString())}</div>
    <h2>Patient information</h2><p>Name: ${escapeReportHtml(profile?.name||'Not provided')}<br>Age: ${escapeReportHtml(profile?.age||'Not provided')}<br>Clinical diagnosis: ${escapeReportHtml(profile?.diagnosis||'Not provided')}<br>Affected side: ${escapeReportHtml(profile?.affectedSide||'Not specified')}<br>Clinician: ${escapeReportHtml(profile?.clinician||'Not provided')}</p>
    <h2>Summary</h2><div class="grid">
    <div class="metric"><div class="value">${recent.length}</div><small>Recorded sessions</small></div>
    <div class="metric"><div class="value">${Math.floor(totalSeconds/60)} min</div><small>Total practice time</small></div>
    <div class="metric"><div class="value">${assessed.length}</div><small>Pain assessments</small></div>
    <div class="metric"><div class="value">${eventCount}</div><small>Raw sensor events</small></div></div>
    <h2>Assessment observations</h2><p>Average pain score change (before minus after): ${avgPainChange===null?'Not enough paired assessments':avgPainChange.toFixed(1)+' points'}.</p>
    <p>Average jaw opening change: ${avgOpeningChange===null?'Not enough paired measurements':avgOpeningChange.toFixed(1)+' mm'}.</p>
    <p class="muted">Pain values are self-reported. Jaw opening values are manually entered measurements. These summaries do not establish treatment effectiveness.</p>
    <h2>Recorded exercise practice</h2><ul>${exerciseRows||'<li>No recorded exercise sessions in this period.</li>'}</ul>
    <h2>Session details</h2><table><thead><tr><th>Date</th><th>Exercise</th><th>Duration</th><th>Pain before → after</th><th>Opening before → after (mm)</th></tr></thead><tbody>${sessionRows||'<tr><td colspan="5">No sessions recorded in this period.</td></tr>'}</tbody></table>
    <h2>Symptom check-in history</h2><table><thead><tr><th>Date</th><th>Symptom</th><th>Pain / 10</th><th>Patient note</th></tr></thead><tbody>${checkInRows||'<tr><td colspan="4">No symptom check-ins in this period.</td></tr>'}</tbody></table>
    <h2>Interpretation & limitations</h2><div class="notice">This report summarizes information entered or recorded by the app. Sensor events are raw threshold-crossing segments, not a validated Bruxism Index or diagnosis. Exercise muscle labels are educational associations, not measured muscle activity. This report is not a diagnosis, prescription, or substitute for clinical assessment. Review the source measurements and clinical context before making care decisions.</div>
    </body></html>`;
}

// RESULTS

function buildRehabilitationInsights(sessions) {
  const ordered = (Array.isArray(sessions) ? sessions : [])
    .filter(item => item && Number.isFinite(Number(item.timestamp || Date.parse(item.date))))
    .slice()
    .sort((a,b) => Number(a.timestamp || Date.parse(a.date)) - Number(b.timestamp || Date.parse(b.date)));
  const pain = ordered.filter(item => item.assessment &&
    Number.isFinite(Number(item.assessment.painBefore)) &&
    Number.isFinite(Number(item.assessment.painAfter)));
  const opening = ordered.filter(item => item.assessment &&
    Number.isFinite(Number(item.assessment.jawOpeningBefore)) &&
    Number.isFinite(Number(item.assessment.jawOpeningAfter)));
  const average = items => items.length
    ? items.reduce((sum,item) => sum + Number(item.assessment.painAfter),0) / items.length
    : null;
  const recentPain = pain.slice(-3);
  const priorPain = pain.slice(-6,-3);
  const recentOpening = opening.slice(-3);
  const priorOpening = opening.slice(-6,-3);
  const recentPainAverage = average(recentPain);
  const priorPainAverage = average(priorPain);
  const openingAverage = items => items.length
    ? items.reduce((sum,item) => sum + (Number(item.assessment.jawOpeningAfter)-Number(item.assessment.jawOpeningBefore)),0) / items.length
    : null;
  let painTrend = 'insufficient_data';
  if (recentPain.length >= 2 && priorPain.length >= 2) {
    const delta = recentPainAverage - priorPainAverage;
    painTrend = delta >= 2 ? 'higher_recent_scores' : delta <= -2 ? 'lower_recent_scores' : 'similar_recent_scores';
  }
  let openingTrend = 'insufficient_data';
  if (recentOpening.length >= 2 && priorOpening.length >= 2) {
    const delta = openingAverage(recentOpening) - openingAverage(priorOpening);
    openingTrend = delta >= 2 ? 'larger_recent_session_changes' : delta <= -2 ? 'smaller_recent_session_changes' : 'similar_recent_session_changes';
  }
  const lastSevenDays = ordered.filter(item => Date.now() - Number(item.timestamp || Date.parse(item.date)) >= 0 &&
    Date.now() - Number(item.timestamp || Date.parse(item.date)) <= 7 * 86400000).length;
  return {
    totalSessions: ordered.length,
    painAssessmentCount: pain.length,
    jawOpeningMeasurementCount: opening.length,
    recentPainAverage: recentPainAverage === null ? null : Number(recentPainAverage.toFixed(1)),
    previousPainAverage: priorPainAverage === null ? null : Number(priorPainAverage.toFixed(1)),
    painTrend,
    recentAverageJawOpeningChangeMm: openingAverage(recentOpening) === null ? null : Number(openingAverage(recentOpening).toFixed(1)),
    previousAverageJawOpeningChangeMm: openingAverage(priorOpening) === null ? null : Number(openingAverage(priorOpening).toFixed(1)),
    jawOpeningTrend: openingTrend,
    sessionsLastSevenDays: lastSevenDays,
    interpretation: 'Descriptive tracking only. Trends require at least two observations in each comparison group and do not establish diagnosis or treatment effect.'
  };
}

function ResultsScreen({sessions,monitor,historyEvents,profile,clinicalEntries}) {
  const [period,setPeriod]=useState('Week');
  const [exporting,setExporting]=useState(false);
  const now=new Date();

  const filtered=sessions.filter(item=>{
    const d=new Date(item.timestamp||item.date);
    if(isNaN(d.getTime()))return false;
    const days=(now-d)/(1000*60*60*24);
    return days>=0&&(period==='Week'?days<=7:days<=30);
  });

  const total=filtered.reduce((a,b)=>a+(Number(b.duration)||0),0);
  const avg=filtered.length?Math.round(total/filtered.length):0;
  const assessedSessions=filtered.filter(item=>item.assessment && Number.isFinite(Number(item.assessment.painBefore)) && Number.isFinite(Number(item.assessment.painAfter)));
  const averagePainChange=assessedSessions.length
    ? assessedSessions.reduce((sum,item)=>sum+(Number(item.assessment.painBefore)-Number(item.assessment.painAfter)),0)/assessedSessions.length
    : null;
  const measuredOpening=filtered.filter(item=>item.assessment && Number.isFinite(Number(item.assessment.jawOpeningBefore)) && Number.isFinite(Number(item.assessment.jawOpeningAfter)));
  const averageOpeningChange=measuredOpening.length
    ? measuredOpening.reduce((sum,item)=>sum+(Number(item.assessment.jawOpeningAfter)-Number(item.assessment.jawOpeningBefore)),0)/measuredOpening.length
    : null;
  const clinicalInsights = buildRehabilitationInsights(sessions);

  const chartData=Array.from({length:7},(_,i)=>{
    const d=new Date();
    d.setDate(d.getDate()-(6-i));
    const day=d.toDateString();

    const duration=sessions.filter(x=>{
      const xd=new Date(x.timestamp||x.date);
      return !isNaN(xd.getTime())&&xd.toDateString()===day;
    }).reduce((a,b)=>a+(Number(b.duration)||0),0);

    return {label:['S','M','T','W','T','F','S'][d.getDay()],value:duration};
  });

  const max=Math.max(60,...chartData.map(x=>x.value));
  const liveEvents = Array.isArray(monitor && monitor.events) ? monitor.events : [];
  const monitoringEvents = Array.from(new Map([...(historyEvents || []),...liveEvents].filter(event=>event && event.startTime).map(event=>[String(event.channel||'sensor')+':'+String(event.startTime),event])).values()).sort((a,b)=>Number(a.startTime)-Number(b.startTime));
  const eventChartData = Array.from({length:7},(_,i)=>{
    const d=new Date();
    d.setDate(d.getDate()-(6-i));
    const day=d.toDateString();
    const dayEvents=monitoringEvents.filter(event=>{
      const eventDate=new Date(event.startTime);
      return !isNaN(eventDate.getTime())&&eventDate.toDateString()===day;
    });
    return {
      label:['S','M','T','W','T','F','S'][d.getDay()],
      count:dayEvents.length,
    };
  });
  const maxEvents=Math.max(1,...eventChartData.map(item=>item.count));

  async function exportReport() {
    if (exporting) return;
    setExporting(true);
    try {
      if (Platform.OS === 'web') {
        Alert.alert('PDF report','PDF export is available in the Android/iOS app build.');
        return;
      }
      const html=buildPatientReportHtml({sessions,clinicalEntries,monitoringEvents,profile,period});
      const file=await Print.printToFileAsync({html,base64:false});
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',dialogTitle:'Share Smart TMJ report',UTI:'com.adobe.pdf'});
      } else {
        await Print.printAsync({html});
      }
    } catch(error) {
      Alert.alert('Report export failed',error?.message||'Unable to create the report right now.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Results Dashboard</Heading>
      <Text style={s.subtitle}>Your saved practice statistics</Text>
      <Btn title={exporting?'Preparing report...':'Export Patient / Therapist PDF'} onPress={exportReport} disabled={exporting}/>
      <Text style={s.small}>Creates a shareable PDF for the selected reporting period. Review patient details before sharing.</Text>

      <View style={s.periodRow}>
        {['Week','Month'].map(x=>(
          <TouchableOpacity
            key={x}
            onPress={()=>setPeriod(x)}
            style={[s.periodButton,period===x&&s.periodActive]}
          >
            <Text style={[s.periodText,period===x&&{color:C.white}]}>{x}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.row}>
        <Metric value={filtered.length} label="Sessions"/>
        <Metric value={Math.floor(total/60)+' min'} label="Total time"/>
      </View>
      <View style={s.row}>
        <Metric value={Math.floor(avg/60)+' min'} label="Average time"/>
        <Metric value={sessions.length} label="All-time sessions"/>
      </View>

      <Section>Weekly Activity</Section>
      <Card>
        <Text style={s.cardTitle}>Daily practice duration</Text>
        <View style={s.chart}>
          {chartData.map((x,i)=>(
            <View key={i} style={s.chartColumn}>
              <Text style={s.chartValue}>{x.value?Math.round(x.value/60)+'m':''}</Text>
              <View style={s.chartBarBackground}>
                <View style={[s.chartBar,{height:Math.max(4,x.value/max*100)+'%'}]}/>
              </View>
              <Text style={s.chartLabel}>{x.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.small}>Chart based on saved session durations.</Text>
      </Card>

      <Section>Sensor Activity Trend</Section>
      <Card>
        <Text style={s.cardTitle}>Recorded sensor events · Last 7 days</Text>
        {monitoringEvents.length===0 ? (
          <Text style={s.body}>No sensor events are available in this monitoring session yet. Connect the hardware and use calibrated sensor settings to populate this chart.</Text>
        ) : (
          <>
            <View style={s.chart}>
              {eventChartData.map((item,index)=>(
                <View key={index} style={s.chartColumn}>
                  <Text style={s.chartValue}>{item.count ? item.count : ''}</Text>
                  <View style={s.chartBarBackground}>
                    <View style={[s.chartBar,{height:Math.max(item.count?4:0,item.count/maxEvents*100)+'%',backgroundColor:C.aqua}]}/>
                  </View>
                  <Text style={s.chartLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={s.small}>Events: {monitoringEvents.length} · Total recorded activity: {Math.round(monitoringEvents.reduce((sum,event)=>sum+Math.max(0,Number(event.duration)||0)/1000,0))} seconds.</Text>
          </>
        )}
        <Text style={s.small}>These are raw threshold-crossing activity segments, not a clinical Bruxism Index or diagnosis.</Text>
      </Card>

      <Section>Rehabilitation Outcomes</Section>
      <Card>
        <Text style={s.cardTitle}>Self-reported assessment trends</Text>
        {averagePainChange===null ? (
          <Text style={s.body}>Pain trends will appear after sessions include before-and-after scores.</Text>
        ) : (
          <Text style={s.body}>Average pain score change: {averagePainChange>0?'−':''}{averagePainChange.toFixed(1)} points per assessed session (before minus after).</Text>
        )}
        {averageOpeningChange===null ? (
          <Text style={s.body}>Jaw opening trends require optional measured values before and after sessions.</Text>
        ) : (
          <Text style={s.body}>Average jaw opening change: {averageOpeningChange>0?'+':''}{averageOpeningChange.toFixed(1)} mm per measured session.</Text>
        )}
        <Text style={s.small}>Based on {assessedSessions.length} pain assessments and {measuredOpening.length} paired jaw-opening measurements. These are self-reported/entered observations, not proof of treatment effectiveness.</Text>
      </Card>

      <Section>Smart Clinical Insights</Section>
      <Card>
        <Text style={s.cardTitle}>Rehabilitation tracking signals</Text>
        <Text style={s.body}>Pain trend: {clinicalInsights.painTrend==='higher_recent_scores'?'Recent recorded scores are higher than the previous comparison period.':clinicalInsights.painTrend==='lower_recent_scores'?'Recent recorded scores are lower than the previous comparison period.':clinicalInsights.painTrend==='similar_recent_scores'?'Recent recorded scores are broadly similar to the previous comparison period.':'Not enough repeated pain assessments to compare trends.'}</Text>
        <Text style={s.body}>Jaw opening: {clinicalInsights.jawOpeningTrend==='larger_recent_session_changes'?'Recent before/after changes are larger than the previous comparison period.':clinicalInsights.jawOpeningTrend==='smaller_recent_session_changes'?'Recent before/after changes are smaller than the previous comparison period.':clinicalInsights.jawOpeningTrend==='similar_recent_session_changes'?'Recent before/after changes are broadly similar to the previous comparison period.':'Not enough repeated paired measurements to compare trends.'}</Text>
        <Text style={s.body}>Practice recorded in the last 7 days: {clinicalInsights.sessionsLastSevenDays} sessions.</Text>
        <Text style={s.small}>Comparison uses up to the latest 3 assessments versus the preceding 3, and requires at least 2 in each group. These are tracking signals only, not diagnosis or evidence that an exercise caused a change.</Text>
      </Card>

      <Section>Progress Summary</Section>
      <Card>
        <Text style={s.cardTitle}>Practice consistency</Text>
        <Text style={s.body}>
          {filtered.length
            ?'You recorded '+filtered.length+' sessions during this period.'
            :'No saved sessions in this period yet.'}
        </Text>
        <Bar value={Math.min(filtered.length/7*100,100)}/>
        <Text style={s.small}>Reference: 7 sessions per week, not a medical target.</Text>
      </Card>

      <Section>Session History</Section>
      {sessions.length===0?(
        <Card><Text style={s.body}>Your sessions will appear here after saving.</Text></Card>
      ):(
        [...sessions].reverse().map(x=>(
          <Card key={x.id}>
            <View style={s.between}>
              <Text style={s.cardTitle}>{x.exercise||'Practice Session'}</Text>
              <Tag>Saved</Tag>
            </View>
            <Text style={s.body}>
              Duration: {Math.floor(x.duration/60)} min {x.duration%60} sec
            </Text>
            <Text style={s.small}>{x.date}</Text>
            {x.assessment && (
              <View style={{marginTop:8}}>
                <Text style={s.body}>Pain: {x.assessment.painBefore ?? '—'}/10 before → {x.assessment.painAfter ?? '—'}/10 after</Text>
                {(x.assessment.jawOpeningBefore !== null || x.assessment.jawOpeningAfter !== null) && (
                  <Text style={s.body}>Jaw opening: {x.assessment.jawOpeningBefore ?? '—'} mm → {x.assessment.jawOpeningAfter ?? '—'} mm</Text>
                )}
              </View>
            )}
          </Card>
        ))
      )}

      <Card>
        <Text style={s.cardTitle}>Data interpretation</Text>
        <Text style={s.body}>
          These charts describe app usage and practice duration only.
          They do not measure pain, bruxism severity, EMG activity or jaw pressure.
        </Text>
      </Card>
    </ScrollView>
  );
}

// DEVICE CENTER

function DevicesScreen({devices,setPage,monitor}) {
  const [bleState,setBleState] = useState(() => deviceManager.getState());
  const [serviceUUID,setServiceUUID] = useState('');
  const [notifyUUID,setNotifyUUID] = useState('');
  const [writeUUID,setWriteUUID] = useState('');
  const [threshold,setThreshold] = useState('');
  const [busy,setBusy] = useState(false);
  const liveEvents = Array.isArray(monitor && monitor.events) ? monitor.events : [];
  const liveReadings = (monitor && monitor.readings) || {};

  useEffect(() => {
    const unsubscribe = deviceManager.subscribe(setBleState);
    deviceManager.initialize();
    AsyncStorage.getItem('@smart_tmj_ble_gatt').then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      setServiceUUID(saved.serviceUUID || '');
      setNotifyUUID(saved.notifyCharacteristicUUID || '');
      setWriteUUID(saved.writeCharacteristicUUID || '');
      deviceManager.configureGatt(saved).catch(() => {});
    }).catch(() => {});
    AsyncStorage.getItem('@smart_tmj_detection_threshold').then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && saved.value !== undefined) {
        setThreshold(String(saved.value));
        deviceManager.setDetectionThreshold(saved.value, saved.channel || 'all');
      }
    }).catch(() => {});
    return () => {
      unsubscribe();
      deviceManager.stopScan();
    };
  }, []);

  const scan = async () => {
    setBusy(true);
    try {
      await deviceManager.scan(12000);
    } catch (error) {
      Alert.alert('Bluetooth scan', error.message || 'Unable to scan for BLE devices.');
    } finally {
      setBusy(false);
    }
  };

  const connect = async device => {
    setBusy(true);
    try {
      await deviceManager.configureGatt({
        serviceUUID: serviceUUID.trim() || null,
        notifyCharacteristicUUID: notifyUUID.trim() || null,
        writeCharacteristicUUID: writeUUID.trim() || null,
      });
      await deviceManager.connect(device.id);
      Alert.alert(
        'Device connected',
        'The BLE connection is active. Configure the firmware UUIDs above to receive sensor notifications.'
      );
    } catch (error) {
      Alert.alert('Connection failed', error.message || 'Could not connect to this device.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    try { await deviceManager.disconnect(); }
    catch (error) { Alert.alert('Disconnect', error.message || 'Could not disconnect.'); }
  };

  const bluetooth = bleState.bluetooth || {};
  const connected = bleState.activeDevice;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Device Center</Heading>
      <Text style={s.subtitle}>Bluetooth Low Energy · Hardware integration</Text>

      <Card style={s.hero}>
        <View style={s.between}>
          <Text style={s.cardTitle}>Bluetooth adapter</Text>
          <Tag color={bluetooth.adapterState === 'PoweredOn' ? '#103D49' : '#49351F'}>
            {bluetooth.adapterState || 'Checking'}
          </Tag>
        </View>
        <Text style={s.heroTitle}>{connected ? connected.name : 'Connect a sensor device'}</Text>
        {connected && connected.batteryLevel !== null && connected.batteryLevel !== undefined && <Text style={s.body}>Battery: {connected.batteryLevel}%</Text>}
        <Text style={s.body}>
          {connected
            ? 'Connected over BLE. Sensor notifications require the firmware GATT UUIDs below.'
            : 'Scan for ESP32, ESP32-C3, nRF52, Arduino BLE and compatible custom BLE peripherals.'}
        </Text>
        {connected ? (
          <Btn title="Disconnect device" secondary onPress={disconnect}/>
        ) : (
          <Btn title={busy || bluetooth.scanning ? 'Scanning…' : 'Scan for BLE devices'} onPress={scan}/>
        )}
        {bluetooth.scanning && <Text style={s.small}>Scanning nearby BLE peripherals…</Text>}
        {!!bluetooth.error && <Text style={[s.body,{color:C.orange}]}>{bluetooth.error}</Text>}
      </Card>

      <Section>Discovered BLE Devices</Section>
      {bleState.devices.length === 0 ? (
        <Card><Text style={s.body}>No devices discovered yet. Turn on your hardware and start a scan.</Text></Card>
      ) : (
        bleState.devices.map(device => (
          <Card key={device.id}>
            <View style={s.between}>
              <Text style={s.cardTitle}>{device.name}</Text>
              <Tag>{device.rssi === null ? 'BLE' : String(device.rssi)+' dBm'}</Tag>
            </View>
            <Text style={s.small}>ID: {device.id}</Text>
            <Btn title={connected && connected.id === device.id ? 'Connected' : 'Connect'} secondary onPress={()=>connect(device)}/>
          </Card>
        ))
      )}

      <Section>Firmware GATT Configuration</Section>
      <Card>
        <Text style={s.cardTitle}>Service UUID</Text>
        <TextInput value={serviceUUID} onChangeText={setServiceUUID} autoCapitalize="none" placeholder="Provided by firmware" placeholderTextColor={C.muted} style={s.input}/>
        <Text style={s.cardTitle}>Notify Characteristic UUID</Text>
        <TextInput value={notifyUUID} onChangeText={setNotifyUUID} autoCapitalize="none" placeholder="PVDF sensor data characteristic" placeholderTextColor={C.muted} style={s.input}/>
        <Text style={s.cardTitle}>Write Characteristic UUID (optional)</Text>
        <TextInput value={writeUUID} onChangeText={setWriteUUID} autoCapitalize="none" placeholder="Biofeedback / device commands" placeholderTextColor={C.muted} style={s.input}/>
        <Btn title="Save GATT configuration" secondary onPress={async ()=>{
          const config = {
            serviceUUID:serviceUUID.trim()||null,
            notifyCharacteristicUUID:notifyUUID.trim()||null,
            writeCharacteristicUUID:writeUUID.trim()||null
          };
          try {
            await AsyncStorage.setItem('@smart_tmj_ble_gatt',JSON.stringify(config));
            await deviceManager.configureGatt(config);
            Alert.alert('Configuration saved','Firmware UUIDs were saved on this device.');
          } catch (error) {
            Alert.alert('Configuration error',error.message||'Could not save BLE configuration.');
          }
        }}/>
        <Text style={s.small}>UUIDs are not guessed. Use the exact values defined by the firmware for each board.</Text>
      </Card>

      <Section>Sensor Calibration & Event Detection</Section>
      <Card>
        <Text style={s.cardTitle}>Raw signal threshold</Text>
        <Text style={s.body}>Enter a threshold in the connected firmware's raw sensor units. This is a configurable activity trigger, not a clinically validated Bruxism threshold.</Text>
        <TextInput value={threshold} onChangeText={setThreshold} keyboardType="decimal-pad" placeholder="Firmware-calibrated value" placeholderTextColor={C.muted} style={s.input}/>
        <Btn title="Save activity threshold" secondary onPress={async ()=>{
          const value = Number(threshold);
          if (!threshold.trim() || !Number.isFinite(value) || value < 0) {
            Alert.alert('Invalid threshold','Enter a non-negative numeric threshold.');
            return;
          }
          const saved = deviceManager.setDetectionThreshold(value,'all');
          if (!saved) {
            Alert.alert('Calibration not saved','The threshold could not be applied.');
            return;
          }
          await AsyncStorage.setItem('@smart_tmj_detection_threshold',JSON.stringify({value,channel:'all',updatedAt:Date.now()}));
          Alert.alert('Threshold saved','The same raw-unit threshold is now applied to left, right and wristband channels. Confirm it against your sensor firmware and calibration procedure.');
        }}/>
        <Text style={s.small}>Configured thresholds: {JSON.stringify(deviceManager.getDetectionThresholds())}</Text>
      </Card>

      <Section>Supported Hardware Families</Section>
      <Card>
        {deviceManager.getSupportedProfiles().map(profile => (
          <Text key={profile} style={s.body}>• {profile}</Text>
        ))}
      </Card>

      <Section>Biofeedback Device Command</Section>
      <Card>
        <Text style={s.body}>Send a manual test command only after your firmware supports the documented command format.</Text>
        <Btn title="Send test haptic command" secondary onPress={async ()=>{
          try {
            await deviceManager.sendCommand('haptic',{durationMs:200});
            Alert.alert('Command sent','The BLE write completed. The firmware may ignore unsupported commands; verify its response separately.');
          } catch (error) {
            Alert.alert('Command not sent',error.message||'Check connection and Write Characteristic UUID.');
          }
        }}/>
      </Card>

      <Section>Live Sensor Data</Section>
      <Card>
        <Text style={s.cardTitle}>PVDF Left</Text>
        <Text style={s.metricValue}>{liveReadings.left ? String(liveReadings.left.value) : '—'}</Text>
        <Text style={s.cardTitle}>PVDF Right</Text>
        <Text style={s.metricValue}>{liveReadings.right ? String(liveReadings.right.value) : '—'}</Text>
        <Text style={s.body}>Recorded events: {liveEvents.length}</Text>
        <Text style={s.small}>Values appear only after the connected device sends valid notification payloads.</Text>
      </Card>

      <Section>Device Interfaces</Section>
      <Card>
        <Text style={s.body}>Smart Night Guard · Sensor hardware</Text>
        <Btn title="Open Night Guard" secondary onPress={()=>setPage('Night Guard')}/>
        <Text style={s.body}>Smart Wristband · Wearable device</Text>
        <Btn title="Open Smart Watch" secondary onPress={()=>setPage('Smart Watch')}/>
      </Card>
    </ScrollView>
  );
}

// NIGHT GUARD

function NightGuardScreen() {
  const [armed,setArmed]=useState(false);

  return (
    <ScrollView>
      <Heading>Smart Night Guard</Heading>
      <Text style={s.subtitle}>Nighttime dental sensor interface</Text>

      <Card style={s.guardHero}>
        <Text style={s.guardIcon}>◉</Text>
        <Text style={s.heroTitle}>Night Guard</Text>
        <Tag color="#FFF0DF">NOT CONNECTED</Tag>
        <Text style={s.body}>
          This is a visual prototype. It cannot detect teeth grinding,
          jaw pressure or muscle activity without physical hardware.
        </Text>
      </Card>

      <Section>Device Status</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Connection</Text>
          <Tag color="#FFF0DF">Offline</Tag>
        </View>
        <View style={s.between}>
          <Text style={s.cardTitle}>Battery</Text>
          <Text style={s.cardTitle}>--</Text>
        </View>
        <View style={s.between}>
          <Text style={s.cardTitle}>Pressure sensor</Text>
          <Text style={s.small}>Not available</Text>
        </View>
        <View style={s.between}>
          <Text style={s.cardTitle}>EMG sensor</Text>
          <Text style={s.small}>Not available</Text>
        </View>
      </Card>

      <Section>Night Routine</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Demo monitoring mode</Text>
          <Switch value={armed} onValueChange={setArmed}/>
        </View>
        <Text style={s.small}>
          This switch only changes the demo screen; it does not start real monitoring.
        </Text>
        {armed&&<Tag>DEMO MODE ENABLED</Tag>}
      </Card>

      <Card>
        <Text style={s.cardTitle}>Planned features</Text>
        <Text style={s.body}>• Bruxism event detection</Text>
        <Text style={s.body}>• Jaw pressure monitoring</Text>
        <Text style={s.body}>• Masseter / temporalis EMG</Text>
        <Text style={s.body}>• Night report and trends</Text>
      </Card>
    </ScrollView>
  );
}

// SMART WATCH

function SmartWatchScreen() {
  const [now,setNow]=useState(new Date());
  const [connected,setConnected]=useState(false);

  useEffect(()=>{
    const timer=setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(timer);
  },[]);

  const time=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const date=now.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});

  return (
    <ScrollView>
      <Heading>Smart Watch</Heading>
      <Text style={s.subtitle}>Wearable clock interface</Text>

      <Card style={s.watchCard}>
        <Tag color="#DDF7F1">SMART TMJ WATCH</Tag>
        <Text style={s.watchTime}>{time}</Text>
        <Text style={s.watchDate}>{date}</Text>
        <View style={s.watchDivider}/>
        <View style={s.row}>
          <View style={s.watchMetric}>
            <Text style={s.watchMetricValue}>--</Text>
            <Text style={s.watchMetricLabel}>Heart rate</Text>
          </View>
          <View style={s.watchMetric}>
            <Text style={s.watchMetricValue}>--</Text>
            <Text style={s.watchMetricLabel}>Steps</Text>
          </View>
          <View style={s.watchMetric}>
            <Text style={s.watchMetricValue}>--</Text>
            <Text style={s.watchMetricLabel}>Battery</Text>
          </View>
        </View>
      </Card>

      <Section>Watch Connection</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Bluetooth status</Text>
          <Tag color="#FFF0DF">{connected?'Demo connected':'Not connected'}</Tag>
        </View>
        <Text style={s.body}>
          The clock runs locally on your phone.
          Health metrics are placeholders until a real watch is paired.
        </Text>
        <Btn
          title={connected?'Disconnect demo':'Enable demo connection'}
          secondary
          onPress={()=>setConnected(!connected)}
        />
      </Card>

      <Section>Planned Watch Features</Section>
      <Card>
        <Text style={s.body}>• Time and date</Text>
        <Text style={s.body}>• Jaw relaxation reminders</Text>
        <Text style={s.body}>• Session notifications</Text>
        <Text style={s.body}>• Real wearable data after integration</Text>
      </Card>
    </ScrollView>
  );
}

// DAY MODE

function DayMode({monitor}) {
  const [reminders,setReminders]=useState(true);
  const [awareness,setAwareness]=useState(true);
  const [metStage,setMetStage]=useState(0);
  const [metCycle,setMetCycle]=useState(1);
  const readings=(monitor&&monitor.readings)||{};
  const left=readings.left&&Number.isFinite(Number(readings.left.value))?Number(readings.left.value):null;
  const right=readings.right&&Number.isFinite(Number(readings.right.value))?Number(readings.right.value):null;
  const fresh=[readings.left,readings.right].some(item=>item&&Date.now()-(Number(item.timestamp)||0)<30000);
  const bilateralAvailable=left!==null&&right!==null;
  const difference=bilateralAvailable&&Math.max(Math.abs(left),Math.abs(right))>0
    ? Math.abs(left-right)/Math.max(Math.abs(left),Math.abs(right))*100 : null;
  const metStages=[
    {title:'Baseline assessment',detail:'Observe and record a comfortable resting baseline. Use calibrated hardware and clinician supervision for any force measurement.'},
    {title:'Gentle controlled contraction',detail:'If prescribed by the treating clinician, perform a gentle controlled clench. Do not attempt a maximum voluntary contraction without a validated protocol.'},
    {title:'Hold',detail:'Maintain only the comfortable, clinician-directed effort briefly. Stop if pain or symptoms increase.'},
    {title:'Gradual relaxation',detail:'Release the effort gradually and allow the jaw muscles to return to a relaxed position.'},
    {title:'Assisted opening',detail:'Practice gentle assisted opening only when directed by the treating clinician. Never force the jaw.'}
  ];

  return (
    <ScrollView>
      <Heading>Day Mode ☀</Heading>
      <Text style={s.subtitle}>Daytime awareness</Text>

      <Card style={s.hero}>
        <Tag>DAYTIME ROUTINE</Tag>
        <Text style={s.heroTitle}>Relax your jaw during the day.</Text>
        <Text style={s.body}>Educational awareness and relaxation settings.</Text>
      </Card>

      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Reminder preference</Text>
          <Switch value={reminders} onValueChange={setReminders}/>
        </View>
        <Text style={s.small}>Preference only; notifications are not scheduled yet.</Text>
      </Card>

      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Jaw awareness</Text>
          <Switch value={awareness} onValueChange={setAwareness}/>
        </View>
      </Card>

      <Section>Live Bilateral Signal Comparison</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Left / Right channels</Text>
          <Tag color={fresh?C.mint:C.soft}>{fresh?'LIVE READING':'NO LIVE DATA'}</Tag>
        </View>
        <View style={s.row}>
          <Metric value={left===null?'—':String(left)} label="Left raw signal"/>
          <Metric value={right===null?'—':String(right)} label="Right raw signal"/>
        </View>
        <Text style={s.body}>{difference===null?'Bilateral comparison becomes available when both channels provide valid readings.':('Relative signal difference: '+difference.toFixed(1)+'% (raw signal comparison only).')}</Text>
        <Text style={s.small}>This is a relative raw-signal comparison, not calibrated bite force, MVC, muscle strength or a diagnosis. Compare sides only after sensor placement and calibration are verified.</Text>
      </Card>

      <Section>MET Training · Therapist-Guided</Section>
      <Card>
        <View style={s.between}>
          <Text style={s.cardTitle}>Stage {metStage+1} of {metStages.length}</Text>
          <Tag>Cycle {metCycle} / 5</Tag>
        </View>
        <Text style={s.heroTitle}>{metStages[metStage].title}</Text>
        <Text style={s.body}>{metStages[metStage].detail}</Text>
        <View style={s.chartBarBackground}>
          <View style={[s.chartBar,{height:8,width:((metStage+1)/metStages.length*100)+'%',backgroundColor:C.aqua}]}/>
        </View>
        <Btn title={metStage===metStages.length-1?'Complete cycle':'Next stage'} onPress={()=>{
          if(metStage===metStages.length-1) {
            if(metCycle>=5) {setMetCycle(1);setMetStage(0);Alert.alert('Protocol sequence complete','Five guided cycles completed. Record this only as a completed practice sequence.');}
            else {setMetCycle(x=>x+1);setMetStage(0);}
          } else setMetStage(x=>x+1);
        }}/>
        <Btn title="Reset sequence" secondary onPress={()=>{setMetStage(0);setMetCycle(1);}}/>
        <Text style={s.small}>Workflow guide only. It does not measure MVC, prescribe contraction intensity or replace an individualized therapist protocol.</Text>
      </Card>

      <Section>Daily Tips</Section>
      <Card>
        <Text style={s.cardTitle}>Relaxed jaw</Text>
        <Text style={s.body}>Keep your teeth apart when not eating.</Text>
      </Card>
      <Card>
        <Text style={s.cardTitle}>Posture</Text>
        <Text style={s.body}>Maintain comfortable head and neck alignment.</Text>
      </Card>
      <Card>
        <Text style={s.cardTitle}>Relaxation break</Text>
        <Text style={s.body}>Take a comfortable break when you notice tension.</Text>
      </Card>
    </ScrollView>
  );
}

// NIGHT MODE

function NightMode({setPage,monitor,historyEvents}) {
  const readings = (monitor && monitor.readings) || {};
  const events = Array.from(new Map([...(Array.isArray(historyEvents)?historyEvents:[]),...(Array.isArray(monitor&&monitor.events)?monitor.events:[])].filter(event=>event&&event.startTime).map(event=>[String(event.channel||'sensor')+':'+String(event.startTime),event])).values()).sort((x,y)=>new Date(x.startTime)-new Date(y.startTime));
  const samples = Object.values(readings).filter(Boolean);
  const hasLiveData = samples.length > 0;
  const lastSampleTime = samples.reduce((latest,item) =>
    Math.max(latest,Number(item && item.timestamp)||0),0
  );
  const dataIsFresh = lastSampleTime > 0 && Date.now()-lastSampleTime < 30000;
  const totalEventSeconds = events.reduce((total,event) =>
    total + Math.max(0,Number(event && event.duration)||0)/1000,0
  );
  const left = readings.left && typeof readings.left.value === 'number'
    ? readings.left.value : null;
  const right = readings.right && typeof readings.right.value === 'number'
    ? readings.right.value : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Night Monitoring</Heading>
      <Text style={s.subtitle}>Live jaw activity and recorded sensor events</Text>

      <Card style={s.hero}>
        <View style={s.between}>
          <Text style={s.cardTitle}>Sensor data status</Text>
          <Tag color={dataIsFresh ? '#103D49' : '#49351F'}>
            {dataIsFresh ? 'LIVE DATA' : hasLiveData ? 'LAST READING' : 'NO SENSOR DATA'}
          </Tag>
        </View>
        <Text style={s.heroTitle}>
          {dataIsFresh ? 'Receiving sensor readings' : 'Waiting for real sensor data'}
        </Text>
        <Text style={s.body}>
          {hasLiveData
            ? 'Values below come from the app sensor pipeline. They are not sleep-stage measurements or a clinical diagnosis.'
            : 'Connect compatible hardware and stream calibrated sensor data to begin monitoring. No sleep or bruxism measurements are being generated.'}
        </Text>
      </Card>

      <Section>Jaw Sensor Channels</Section>
      <View style={s.row}>
        <Metric value={left === null ? '—' : String(left)} label="Left channel"/>
        <Metric value={right === null ? '—' : String(right)} label="Right channel"/>
      </View>

      <Section>Recorded Activity</Section>
      <Card>
        <Text style={s.cardTitle}>Event detection calibration</Text>
        <Text style={s.body}>{monitor && monitor.eventDetectionReady ? 'A detection threshold is configured. Events still require validated sensor calibration.' : 'Not configured. No Bruxism severity or event classification will be inferred until a validated threshold is calibrated for the connected hardware.'}</Text>
      </Card>
      <View style={s.row}>
        <Metric value={events.length} label="Recorded events"/>
        <Metric value={Math.round(totalEventSeconds)} label="Event seconds"/>
      </View>

      <Section>Seven-Day Activity Trend</Section>
      <Card>
        <Text style={s.cardTitle}>Recorded sensor events by day</Text>
        {events.length===0 ? (
          <Text style={s.body}>The trend will appear after real sensor events have been recorded.</Text>
        ) : (
          <View style={s.chart}>
            {Array.from({length:7},(_,i)=>{
              const d=new Date();
              d.setDate(d.getDate()-(6-i));
              const day=d.toDateString();
              const count=events.filter(event=>{
                const date=new Date(event.startTime);
                return !isNaN(date.getTime())&&date.toDateString()===day;
              }).length;
              return (
                <View key={day} style={s.chartColumn}>
                  <Text style={s.chartValue}>{count||''}</Text>
                  <View style={s.chartBarBackground}>
                    <View style={[s.chartBar,{height:Math.max(count?4:0,count/Math.max(1,events.length)*100)+'%',backgroundColor:C.aqua}]}/>
                  </View>
                  <Text style={s.chartLabel}>{['S','M','T','W','T','F','S'][d.getDay()]}</Text>
                </View>
              );
            })}
          </View>
        )}
        <Text style={s.small}>Counts are based on events currently held in memory. Historical overnight trends require persistent session aggregation.</Text>
      </Card>

      <Card>
        <Text style={s.cardTitle}>Recent Sensor Activity Events</Text>
        {events.length === 0 ? (
          <Text style={s.body}>No events have been recorded by the monitoring engine yet.</Text>
        ) : (
          events.slice(-8).reverse().map((event,index) => (
            <View key={String(event.startTime||index)+'-'+index} style={{marginTop:10}}>
              <View style={s.between}>
                <Text style={s.cardTitle}>{String(event.channel||'Sensor').toUpperCase()}</Text>
                <Tag>Recorded</Tag>
              </View>
              <Text style={s.body}>
                Duration: {Math.round((Number(event.duration)||0)/1000)} sec
                {' · '}Peak: {Number.isFinite(Number(event.peakValue)) ? event.peakValue : '—'}
              </Text>
              <Text style={s.small}>
                {event.startTime ? new Date(event.startTime).toLocaleString() : 'Time unavailable'}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <Text style={s.cardTitle}>Sleep Analysis</Text>
        <Text style={s.body}>
          Sleep duration, sleep stages and overnight trends require a validated sleep-capable wearable or sensor. These values are not available from the current jaw sensor pipeline.
        </Text>
      </Card>

      <Btn title="Open Smart Night Guard" onPress={()=>setPage('Night Guard')}/>
      <Btn title="Ask AI about my monitoring data" secondary onPress={()=>setPage('AI')}/>
    </ScrollView>
  );
}

// AI ASSISTANT

function AssistantScreen({aiContext}) {
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState([
    {from:'ai',text:'Welcome to Smart TMJ Assistant. Ask me about jaw relaxation, exercises or app features.'}
  ]);

  function answer(q) {
    const t=q.toLowerCase();

    if(t.includes('brux')||t.includes('clench'))
      return 'Bruxism involves clenching or grinding the teeth. A dental professional can assess your symptoms and discuss suitable management.';

    if(t.includes('pain')||t.includes('وجع'))
      return 'Persistent or worsening jaw pain should be assessed by a qualified clinician. Avoid forcing painful movements.';

    if(t.includes('exercise')||t.includes('تمرين'))
      return 'The Exercise Library contains educational guides for relaxation, jaw mobility and posture. Choose only exercises appropriate for your condition.';

    if(t.includes('video')||t.includes('فيديو'))
      return 'Open TMJ Video Library to explore relaxation, jaw mobility, massage, posture, Rocabado and patient education resources.';

    if(t.includes('result')||t.includes('نتائج'))
      return 'Results displays your saved sessions, practice duration and activity history.';

    if(t.includes('device')||t.includes('جهاز')||t.includes('watch'))
      return 'The current version works without physical devices. The watch and Night Guard screens are demonstrations; Bluetooth and sensor integration are future development stages.';

    if(t.includes('emg'))
      return 'EMG measures electrical activity in muscles. This prototype does not currently collect real EMG data.';

    return 'I can help with general TMJ education, exercise guidance and app features. Tell me more about your question.';
  }

  async function send(q=input) {
  if (!q.trim()) return;
  const message = q.trim();
  setMessages(old => [...old, {from:'user', text:message}]);
  setInput('');

  try {
    const response = await fetch(
      'https://orange-barnacle-vp5667j4vqw72p7wr-3000.app.github.dev/api/chat',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message, language: currentLanguage, context: aiContext || {}, history: messages.slice(-12).map(item => ({role: item.from === 'user' ? 'user' : 'model', text: item.text}))})
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Gemini request failed');
    setMessages(old => [...old, {from:'ai', text:data.answer || 'No response received'}]);
  } catch (error) {
    setMessages(old => [...old, {from:'ai', text:'Could not connect to Gemini: ' + error.message}]);
  }
}

  return (
    <View style={{flex:1}}>
      <Heading>AI Assistant</Heading>
      <Text style={s.subtitle}>TMJ educational assistant</Text>

      <ScrollView style={{flex:1}}>
        {messages.map((m,i)=>(
          <View key={i} style={[s.message,m.from==='user'?s.userMessage:s.aiMessage]}>
            <Text style={{color:m.from==='user'?C.white:C.navy}}>{m.text}</Text>
          </View>
        ))}

        <Section>Suggested Questions</Section>
        {[
          'What is bruxism?',
          'How can I relax my jaw?',
          'Explain EMG',
          'Show me TMJ videos',
          'What can Results show?'
        ].map(x=>(
          <TouchableOpacity key={x} onPress={()=>send(x)} style={s.suggestion}>
            <Text style={s.link}>{x} →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.chatInput}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Smart TMJ..."
          style={[s.input,{flex:1}]}
        />
        <TouchableOpacity style={s.send} onPress={()=>send()}>
          <Text style={{color:C.white,fontWeight:'900'}}>Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.small}>Gemini AI · Uses available app context · Educational support, not a diagnosis</Text>
    </View>
  );
}

// PROFILE

function ProfileScreen({profile,setPage}) {
  return (
    <ScrollView>
      <Heading>Profile</Heading>
      <Text style={s.subtitle}>Your personal and clinical overview</Text>

      <Card style={s.center}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{profile.name ? profile.name.trim().charAt(0).toUpperCase() : "U"}</Text>
        </View>
        <Text style={s.cardTitle}>{profile.name||'Smart TMJ User'}</Text>
        <Text style={s.small}>Personal profile · {profile.affectedSide||'Side not specified'}</Text>
        {profile.diagnosis ? <Text style={s.small}>{profile.diagnosis}</Text> : null}
      </Card>

      <Btn title="Patient Management" onPress={()=>setPage('Patients')}/>
      <Btn title="Open Clinical Timeline" onPress={()=>setPage('ClinicalTimeline')}/>
      <Btn title="Patient Management" onPress={()=>setPage('Patients')}/>
      <Section>Settings</Section>
      {[
        ['Personal Information','Personal'],
        ['Notifications','Notifications'],
        ['Treatment Preferences','Treatment'],
        ['Privacy & Storage','Privacy']
      ].map(x=>(
        <TouchableOpacity key={x[1]} onPress={()=>setPage(x[1])}>
          <Card>
            <View style={s.between}>
              <Text style={s.cardTitle}>{x[0]}</Text>
              <Text style={s.link}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <Section>Modes & Devices</Section>
      <Card>
        <Btn title="TMJ Video Library" secondary onPress={()=>setPage('Videos')}/>
        <Btn title="Day Mode" secondary onPress={()=>setPage('Day Mode')}/>
        <Btn title="Night Mode" secondary onPress={()=>setPage('Night Mode')}/>
        <Btn title="Night Guard" secondary onPress={()=>setPage('Night Guard')}/>
        <Btn title="Smart Watch" secondary onPress={()=>setPage('Smart Watch')}/>
      </Card>
    </ScrollView>
  );
}

// PATIENT MANAGEMENT

function PatientManagerScreen({patients,activePatientId,profile,sessions,createPatient,selectPatient}) {
  const [name,setName]=useState('');
  const [age,setAge]=useState('');
  const [showForm,setShowForm]=useState(false);
  return (
    <ScrollView>
      <Heading>Patient Management</Heading>
      <Text style={s.subtitle}>Separate local records for each patient</Text>
      <Card style={s.hero}>
        <Tag>ACTIVE PATIENT</Tag>
        <Text style={s.heroTitle}>{profile?.name||'Unnamed patient'}</Text>
        <Text style={s.body}>Age: {profile?.age||'—'} · {sessions.length} recorded sessions</Text>
      </Card>
      <Btn title={showForm?'Close new patient form':'＋ Add Patient'} onPress={()=>setShowForm(!showForm)}/>
      {showForm&&(
        <Card>
          <Text style={s.cardTitle}>New patient</Text>
          <TextInput value={name} onChangeText={setName} style={s.input} placeholder="Patient display name"/>
          <TextInput value={age} onChangeText={setAge} style={s.input} placeholder="Age (optional)" keyboardType="number-pad"/>
          <Btn title="Create Separate Patient Record" onPress={()=>{
            createPatient(name,age);
            setName('');setAge('');setShowForm(false);
          }}/>
          <Text style={s.small}>Only enter information with the patient's consent. Records are stored locally on this device.</Text>
        </Card>
      )}
      <Section>{patients.length} Patient Records</Section>
      {patients.map(item=>{
        const active=item.id===activePatientId;
        return (
          <Card key={item.id}>
            <View style={s.between}>
              <Text style={s.cardTitle}>{item.profile?.name||'Unnamed patient'}</Text>
              <Tag color={active?C.mint:C.soft}>{active?'Active':'Local record'}</Tag>
            </View>
            <Text style={s.body}>Age: {item.profile?.age||'—'} · {(active?sessions:item.sessions||[]).length} sessions</Text>
            <Text style={s.small}>Created: {item.createdAt?new Date(item.createdAt).toLocaleDateString():'Legacy record'}</Text>
            {!active&&<Btn title="Open Patient Record" secondary onPress={()=>selectPatient(item.id)}/>}
          </Card>
        );
      })}
      <Card>
        <Text style={s.cardTitle}>Privacy & scope</Text>
        <Text style={s.small}>Patient records are separated within this app on this device. This is not a secure multi-user server, cloud account system, or role-based clinical record platform. Protect device access and obtain consent before recording patient information.</Text>
      </Card>
    </ScrollView>
  );
}

// CLINICAL TIMELINE

function ClinicalTimelineScreen({sessions,entries,setEntries,profile,monitoringHistory}) {
  const [note,setNote]=useState('');
  const [pain,setPain]=useState('');
  const [symptom,setSymptom]=useState('Jaw pain');
  const [filter,setFilter]=useState('All');
  const options=['Jaw pain','Jaw stiffness','Clicking / sounds','Locking','Headache','Muscle tension','Other'];
  const timeline=[
    ...(Array.isArray(sessions)?sessions:[]).map(item=>({
      id:'session-'+item.id,
      kind:'session',
      timestamp:Number(item.timestamp)||new Date(item.date).getTime(),
      title:item.exercise||'Practice session',
      detail:(Math.floor((Number(item.duration)||0)/60)+' min '+((Number(item.duration)||0)%60)+' sec')+
        (item.assessment?' · Pain '+(item.assessment.painBefore??'—')+' → '+(item.assessment.painAfter??'—')+'/10':'')
    })),
    ...(Array.isArray(entries)?entries:[]).map(item=>({
      id:'checkin-'+item.id,kind:'checkin',timestamp:Number(item.timestamp)||0,
      title:item.symptom||'Symptom check-in',
      detail:(item.pain!==null&&item.pain!==undefined?'Pain '+item.pain+'/10 · ':'')+(item.note||'No additional note')
    })),
    ...(Array.isArray(monitoringHistory)?monitoringHistory:[]).map((item,index)=>({
      id:'sensor-'+String(item.channel||'sensor')+'-'+String(item.startTime||index),
      kind:'sensor',timestamp:new Date(item.startTime).getTime(),
      title:'Sensor event · '+String(item.channel||'unknown').toUpperCase(),
      detail:'Recorded segment · '+Math.round((Number(item.duration)||0)/1000)+' sec'
    }))
  ].filter(item=>Number.isFinite(item.timestamp)&&item.timestamp>0)
   .sort((x,y)=>y.timestamp-x.timestamp);
  const visible=timeline.filter(item=>filter==='All'||item.kind===filter.toLowerCase());

  function addCheckIn() {
    const cleanNote=note.trim();
    const painValue=pain.trim()===''?null:Number(pain);
    if(painValue!==null&&(!Number.isFinite(painValue)||painValue<0||painValue>10)) {
      Alert.alert('Invalid pain score','Enter a score from 0 to 10, or leave it blank.');
      return;
    }
    if(!cleanNote&&painValue===null) {
      Alert.alert('Add a check-in','Enter a note or pain score before saving.');
      return;
    }
    const item={id:String(Date.now()),timestamp:Date.now(),symptom,pain:painValue,note:cleanNote};
    setEntries(old=>[item,...(Array.isArray(old)?old:[])]);
    setNote('');
    setPain('');
    Alert.alert('Saved','Your symptom check-in was added to the clinical timeline.');
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Clinical Timeline</Heading>
      <Text style={s.subtitle}>Chronological record of practice, symptoms and available sensor events</Text>
      <Card>
        <Text style={s.cardTitle}>Patient record</Text>
        <Text style={s.body}>{profile?.name||'Name not provided'} · Age {profile?.age||'—'}</Text>
        <Text style={s.small}>Stored locally on this device</Text>
      </Card>
      <Section>New Symptom Check-in</Section>
      <Card>
        <Text style={s.small}>Symptom</Text>
        <View style={s.categoryRow}>
          {options.map(item=>(
            <TouchableOpacity key={item} onPress={()=>setSymptom(item)} style={[s.category,symptom===item&&s.categoryActive]}>
              <Text style={[s.categoryText,symptom===item&&{color:C.white}]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.small}>Pain score · Optional (0–10)</Text>
        <TextInput value={pain} onChangeText={setPain} keyboardType="number-pad" style={s.input} placeholder="0–10" placeholderTextColor={C.muted}/>
        <Text style={s.small}>Notes · Optional</Text>
        <TextInput value={note} onChangeText={setNote} style={[s.input,{minHeight:82,textAlignVertical:'top'}]} multiline placeholder="Describe what you noticed..." placeholderTextColor={C.muted}/>
        <Btn title="Save Symptom Check-in" onPress={addCheckIn}/>
      </Card>
      <Section>Timeline Filters</Section>
      <View style={s.periodRow}>
        {['All','Session','Checkin','Sensor'].map(item=>(
          <TouchableOpacity key={item} onPress={()=>setFilter(item)} style={[s.periodButton,filter===item&&s.periodActive]}>
            <Text style={[s.periodText,filter===item&&{color:C.white}]}>{item==='Checkin'?'Check-ins':item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Section>{visible.length} Timeline Records</Section>
      {visible.length===0 ? (
        <Card><Text style={s.body}>No records yet. Save a symptom check-in or complete a session to begin your timeline.</Text></Card>
      ) : visible.map(item=>(
        <Card key={item.id}>
          <View style={s.between}>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Tag color={item.kind==='checkin'?C.mint:item.kind==='sensor'?'#49351F':C.soft}>{item.kind==='checkin'?'Check-in':item.kind==='sensor'?'Sensor':'Session'}</Tag>
          </View>
          <Text style={s.body}>{item.detail}</Text>
          <Text style={s.small}>{new Date(item.timestamp).toLocaleString()}</Text>
        </Card>
      ))}
      <Card>
        <Text style={s.cardTitle}>Clinical interpretation</Text>
        <Text style={s.small}>This timeline is a record of user-entered notes, saved practice sessions and raw sensor events. It does not diagnose a condition or establish a causal relationship between activity and symptoms.</Text>
      </Card>
    </ScrollView>
  );
}

// SETTINGS

function SettingsScreen({page,profile,setProfile}) {
  const [name,setName]=useState(profile.name||'');
  const [age,setAge]=useState(profile.age||'');
  const [diagnosis,setDiagnosis]=useState(profile.diagnosis||'');
  const [affectedSide,setAffectedSide]=useState(profile.affectedSide||'Not specified');
  const [clinician,setClinician]=useState(profile.clinician||'');

  const titles={
    Personal:'Personal Information',
    Notifications:'Notifications',
    Treatment:'Treatment Preferences',
    Privacy:'Privacy & Storage'
  };

  return (
    <ScrollView>
      <Heading>{titles[page]||'Settings'}</Heading>
      <Text style={s.subtitle}>Manage your preferences</Text>

      {page==='Personal'&&(
        <Card>
          <Text style={s.cardTitle}>Display Name</Text>
          <TextInput value={name} onChangeText={setName} style={s.input} placeholder="Your name"/>
          <Text style={s.cardTitle}>Age</Text>
          <TextInput
            value={String(age)}
            onChangeText={setAge}
            style={s.input}
            keyboardType="numeric"
            placeholder="Your age"
          />
          <Text style={s.cardTitle}>Clinical diagnosis · Optional</Text>
          <TextInput value={diagnosis} onChangeText={setDiagnosis} style={s.input} placeholder="Clinician-confirmed diagnosis"/>
          <Text style={s.cardTitle}>Affected side</Text>
          <View style={s.categoryRow}>
            {['Not specified','Left','Right','Both'].map(side=>(
              <TouchableOpacity key={side} onPress={()=>setAffectedSide(side)} style={[s.category,affectedSide===side&&s.categoryActive]}>
                <Text style={[s.categoryText,affectedSide===side&&{color:C.white}]}>{side}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.cardTitle}>Treating clinician · Optional</Text>
          <TextInput value={clinician} onChangeText={setClinician} style={s.input} placeholder="Clinician name"/>
          <Btn
            title="Save Profile"
            onPress={()=>{
              setProfile(old=>({...old,name,age,diagnosis,affectedSide,clinician}));
              Alert.alert('Saved','Your profile was saved.');
            }}
          />
        </Card>
      )}

      {page==='Notifications'&&(
        <Card>
          <Text style={s.cardTitle}>Notifications</Text>
          <Text style={s.body}>Notification scheduling will be added in a future version.</Text>
        </Card>
      )}

      {page==='Treatment'&&(
        <Card>
          <Text style={s.cardTitle}>Treatment Preferences</Text>
          <Text style={s.body}>Exercise library: Available</Text>
          <Text style={s.body}>TMJ Video Library: Available</Text>
          <Text style={s.body}>Day mode: Available</Text>
          <Text style={s.body}>Night mode: Interface preview</Text>
        </Card>
      )}

      {page==='Privacy'&&(
        <Card>
          <Text style={s.cardTitle}>Local Data Storage</Text>
          <Text style={s.body}>
            Your session history and profile are stored locally on this device.
            There is no cloud synchronization or account login.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

// MAIN APP

export default function App() {
  const [language,setLanguage]=useState('en');
  currentLanguage=language;
  const [tab,setTab]=useState('Home');
  const [page,setPage]=useState('Home');

  const [sessions,setSessions]=useState([]);
  const [clinicalEntries,setClinicalEntries]=useState([]);
  const [devices,setDevices]=useState(defaultDevices);
  const [profile,setProfile]=useState({name:'',age:''});
  const [patients,setPatients]=useState([]);
  const [activePatientId,setActivePatientId]=useState('default-patient');
  const [loaded,setLoaded]=useState(false);
  const [monitoringHistory,setMonitoringHistory]=useState([]);
  const liveMonitor = useSensorMonitor(activePatientId);

  useEffect(()=>{
    let alive=true;

    async function load() {
      try {
        const savedLanguage=await AsyncStorage.getItem('@smart_tmj_language');
        if(alive && (savedLanguage==='ar'||savedLanguage==='en')) { currentLanguage=savedLanguage; setLanguage(savedLanguage); }
        const saved=await AsyncStorage.getItem(KEY);

        if(saved) {
          const data=JSON.parse(saved);

          if(alive) {
            if(Array.isArray(data.sessions))
              setSessions(data.sessions);
            if(Array.isArray(data.clinicalEntries))
              setClinicalEntries(data.clinicalEntries);

            if(Array.isArray(data.devices)) {
              const merged=defaultDevices.map(d=>
                data.devices.find(x=>x.id===d.id)||d
              );
              setDevices(merged);
            }

            if(data.profile)
              setProfile(data.profile);
            let selectedPatientId='default-patient';
            if(Array.isArray(data.patients) && data.patients.length) {
              setPatients(data.patients);
              const active=data.patients.find(item=>item.id===data.activePatientId)||data.patients[0];
              selectedPatientId=active.id;
              setActivePatientId(active.id);
              setProfile(active.profile||{name:'',age:''});
              setSessions(Array.isArray(active.sessions)?active.sessions:[]);
              setClinicalEntries(Array.isArray(active.clinicalEntries)?active.clinicalEntries:[]);
            } else {
              const legacyId='default-patient';
              const legacy={id:legacyId,profile:data.profile||{name:'',age:''},sessions:Array.isArray(data.sessions)?data.sessions:[],clinicalEntries:Array.isArray(data.clinicalEntries)?data.clinicalEntries:[],createdAt:Date.now()};
              setPatients([legacy]);
              setActivePatientId(legacyId);
            }
            const savedEvents=await getSavedMonitoringEvents(selectedPatientId);
            if(alive && Array.isArray(savedEvents)) setMonitoringHistory(savedEvents);
          }
        } else {
          const savedEvents=await getSavedMonitoringEvents('default-patient');
          if(alive && Array.isArray(savedEvents)) setMonitoringHistory(savedEvents);
        }
      } catch(e) {
        console.log('Load error',e);
      } finally {
        if(alive)setLoaded(true);
      }
    }

    load();
    return ()=>{alive=false;};
  },[]);

  useEffect(()=>{
    if(!loaded)return;

    const patientRecords=patients.map(item=>item.id===activePatientId
      ? {...item,profile,sessions,clinicalEntries}
      : item
    );
    if(!patientRecords.some(item=>item.id===activePatientId)) {
      patientRecords.push({id:activePatientId,profile,sessions,clinicalEntries,createdAt:Date.now()});
    }
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({sessions,devices,profile,clinicalEntries,patients:patientRecords,activePatientId})
    ).catch(e=>console.log('Save error',e));
    if(patientRecords.length!==patients.length || patientRecords.some((item,index)=>item!==patients[index])) setPatients(patientRecords);
  },[sessions,devices,profile,clinicalEntries,loaded]);

  function navigate(id) {
    if (id === 'More') id = 'Profile';
    setPage(id);
    if (tabs.some(x=>x.id===id)) setTab(id);
    else if (id === 'Night Mode') setTab('Night Mode');
    else if (id === 'Profile') setTab('More');
    else if (id === 'Devices' || id === 'Night Guard' || id === 'Smart Watch' || id === 'Day Mode' || id === 'Videos') setTab('More');
  }

  function createPatient(name,age) {
    const cleanName=String(name||'').trim();
    if(!cleanName) {
      Alert.alert('Patient name required','Enter a name before creating a patient record.');
      return;
    }
    const id='patient-'+Date.now();
    const record={id,profile:{name:cleanName,age:String(age||'').trim()},sessions:[],clinicalEntries:[],createdAt:Date.now()};
    setPatients(old=>[...old,record]);
    setActivePatientId(id);
    setProfile(record.profile);
    setSessions([]);
    setClinicalEntries([]);
    setMonitoringHistory([]);
    setPage('Patients');
    setTab('More');
  }

  function selectPatient(id) {
    if(id===activePatientId) return;
    const current={id:activePatientId,profile,sessions,clinicalEntries};
    const records=patients.map(item=>item.id===activePatientId?{...item,...current}:item);
    const target=records.find(item=>item.id===id);
    if(!target) return;
    setPatients(records);
    setActivePatientId(id);
    deviceManager.resetMonitoringData();
    setProfile(target.profile||{name:'',age:''});
    setSessions(Array.isArray(target.sessions)?target.sessions:[]);
    setClinicalEntries(Array.isArray(target.clinicalEntries)?target.clinicalEntries:[]);
    getSavedMonitoringEvents(id).then(events=>setMonitoringHistory(events)).catch(()=>setMonitoringHistory([]));
    setPage('Home');
    setTab('Home');
  }

  function finish(duration,exercise,assessment = {}) {
    const {
      exerciseId = null,
      focus = 'General practice',
      targetMuscles = [],
      movement = 'Unspecified',
      ...outcomeAssessment
    } = assessment;
    const item={
      id:String(Date.now()),
      duration,
      exercise,
      exerciseId,
      focus,
      targetMuscles,
      movement,
      timestamp:Date.now(),
      date:new Date().toLocaleString(),
      assessment:outcomeAssessment
    };

    setSessions(old=>[...old,item]);
    setPage('Results');
    setTab('Results');
  }

  function screen() {
    if(!loaded) {
      return (
        <View style={s.center}>
          <Text style={s.cardTitle}>Loading Smart TMJ...</Text>
        </View>
      );
    }

    if(page==='Home')
      return <HomeScreen sessions={sessions} setPage={navigate} devices={devices} profile={profile}/>;

    if(page==='Exercises')
      return <ExercisesScreen setPage={navigate} sessions={sessions}/>;

    if(page==='Videos')
      return <VideosScreen/>;

    if(page.startsWith('exercise:')) {
      const item=exerciseItems.find(x=>x.id===page.split(':')[1]);
      if(item)return <ExerciseDetails item={item} setPage={navigate}/>;
    }

    if(page.startsWith('Session')) {
      const item=exerciseItems.find(x=>x.id===page.split(':')[1]);
      return <SessionScreen finish={finish} exercise={item} monitor={liveMonitor}/>;
    }

    if(page==='Results')
      return <ResultsScreen sessions={sessions} monitor={liveMonitor} historyEvents={monitoringHistory} profile={profile} clinicalEntries={clinicalEntries}/>;

    if(page==='Patients')
      return <PatientManagerScreen patients={patients} activePatientId={activePatientId} profile={profile} sessions={sessions} createPatient={createPatient} selectPatient={selectPatient}/>;

    if(page==='ClinicalTimeline')
      return <ClinicalTimelineScreen sessions={sessions} entries={clinicalEntries} setEntries={setClinicalEntries} profile={profile} monitoringHistory={monitoringHistory}/>;

    if(page==='Devices')
      return <DevicesScreen devices={devices} setPage={navigate} monitor={liveMonitor}/>;

    if(page==='Night Guard')
      return <NightGuardScreen/>;

    if(page==='Smart Watch')
      return <SmartWatchScreen/>;

    if(page==='Day Mode')
      return <DayMode monitor={liveMonitor}/>;

    if(page==='Night Mode')
      return <NightMode setPage={navigate} monitor={liveMonitor} historyEvents={monitoringHistory}/>;

    if(page==='AI')
      return <AssistantScreen aiContext={{
        profile,
        recentSymptomCheckIns: clinicalEntries.slice(0,20),
        devices: devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          connected: Boolean(device.connected),
          connectionSource: device.connected ? 'app device state' : 'not connected'
        })),
        exerciseSessions: sessions.slice(-30),
        clinicalInsights: buildRehabilitationInsights(sessions),
        rehabilitationSummary: (() => {
          const assessed = sessions.filter(item => item.assessment && Number.isFinite(Number(item.assessment.painBefore)) && Number.isFinite(Number(item.assessment.painAfter)));
          const measured = sessions.filter(item => item.assessment && Number.isFinite(Number(item.assessment.jawOpeningBefore)) && Number.isFinite(Number(item.assessment.jawOpeningAfter)));
          return {
            assessedSessionCount: assessed.length,
            latestAssessment: assessed.length ? assessed[assessed.length - 1].assessment : null,
            averagePainBefore: assessed.length ? assessed.reduce((sum,item)=>sum+Number(item.assessment.painBefore),0)/assessed.length : null,
            averagePainAfter: assessed.length ? assessed.reduce((sum,item)=>sum+Number(item.assessment.painAfter),0)/assessed.length : null,
            measuredOpeningSessionCount: measured.length,
            latestJawOpening: measured.length ? {
              beforeMm: measured[measured.length - 1].assessment.jawOpeningBefore,
              afterMm: measured[measured.length - 1].assessment.jawOpeningAfter
            } : null
          };
        })(),
        monitoring: {
          readings: liveMonitor.readings || {},
          events: Array.from(new Map([...(monitoringHistory || []),...(Array.isArray(liveMonitor.events) ? liveMonitor.events : [])].filter(event=>event && event.startTime).map(event=>[String(event.channel||'sensor')+':'+String(event.startTime),event])).values()).slice(-100),
          thresholds: deviceManager.getDetectionThresholds(),
          eventDetectionReady: Boolean(liveMonitor.eventDetectionReady),
          eventInterpretation: 'Events represent raw threshold-crossing activity segments only. They are not a validated Bruxism diagnosis or sleep-stage analysis.',
          receivedAt: liveMonitor.receivedAt || null,
          dataAvailability: Object.values(liveMonitor.readings || {}).some(item => item && Number.isFinite(Number(item.timestamp)) && Date.now() - Number(item.timestamp) < 30000)
            ? 'fresh readings received in local monitor state'
            : 'no recent live sensor readings available'
        },
        exerciseLibrary: exerciseItems.map(item => ({
          title: item.title,
          category: item.category,
          durationMinutes: item.duration,
          level: item.level,
          focus: item.focus,
          movement: item.movement,
          targetMuscles: item.targetMuscles,
          goal: item.goal
        })),
        appCapabilities: {
          liveBluetoothTransport: 'BLE transport is implemented in source; a custom native build and physical hardware validation are required before claiming it works on-device',
          eventDetectionReady: Boolean(liveMonitor.eventDetectionReady),
          nightMonitoring: 'interface preview; no sleep monitoring confirmed',
          sensorCalibration: 'not provided'
        }
      }}/>;

    if(page==='Profile')
      return <ProfileScreen profile={profile} setPage={navigate}/>;

    return <SettingsScreen page={page} profile={profile} setProfile={setProfile}/>;
  }

  const title=
    page.startsWith('exercise:')?'Exercise Guide':
    page.startsWith('Session')?'Active Session':
    page==='Videos'?'TMJ Video Library':
    page;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>

      <View style={s.header}>
        <View style={s.logo}>
          <Text style={s.logoText}>⌁</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={s.brand}>Smart TMJ Pro</Text>
          <Text style={s.small}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => { const next=language==='en'?'ar':'en'; currentLanguage=next; setLanguage(next); AsyncStorage.setItem('@smart_tmj_language',next).catch(()=>{}); }} style={[s.headerAction,{width:48}] } accessibilityLabel="Switch language"><Text style={s.headerActionText}>{language==='en'?'عربي':'EN'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('AI')} style={s.headerAction}><Text style={s.headerActionText}>✧</Text></TouchableOpacity>
      </View>

      <View style={s.content}>
        {screen()}
      </View>

      <View style={s.nav}>
        {tabs.map(x=>(
          <TouchableOpacity
            key={x.id}
            onPress={()=>navigate(x.id)}
            style={s.navItem}
          >
            <Text style={[s.navIcon,tab===x.id&&s.active]}>{x.icon}</Text>
            <Text style={[s.navLabel,tab===x.id&&s.active]}>{x.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// DESIGN SYSTEM

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},
  homeContent:{paddingBottom:18},
  homeTopRow:{flexDirection:'row',alignItems:'center',marginBottom:18},
  homeEyebrow:{fontSize:9,color:C.teal,fontWeight:'900',letterSpacing:1.3},
  homeWelcome:{fontSize:24,color:C.navy,fontWeight:'900',marginTop:6},
  homeSubheading:{fontSize:12,color:C.muted,marginTop:4},
  homeAvatar:{width:44,height:44,borderRadius:22,backgroundColor:'#25455A',borderWidth:1,borderColor:'#287D87',alignItems:'center',justifyContent:'center'},
  homeAvatarText:{color:C.teal,fontWeight:'900',fontSize:18},
  deviceHero:{backgroundColor:'#10364B',borderRadius:23,padding:18,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#176A77',marginBottom:19,overflow:'hidden'},
  deviceHeroCopy:{flex:1,paddingRight:10},
  deviceHeroKicker:{fontSize:9,color:'#8BD9DF',fontWeight:'900',letterSpacing:1.2},
  deviceHeroTitle:{fontSize:20,color:'#FFFFFF',fontWeight:'900',marginTop:8},
  deviceHeroBody:{fontSize:11,color:'#BED2DF',lineHeight:17,marginTop:6},
  deviceStatusPill:{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',backgroundColor:'#0B293B',paddingHorizontal:10,paddingVertical:7,borderRadius:20,marginTop:12},
  statusDot:{width:7,height:7,borderRadius:4,backgroundColor:'#20DFB1',marginRight:6},
  statusDotOn:{backgroundColor:'#20DFB1'},statusDotOff:{backgroundColor:'#F5B75E'},
  deviceStatusText:{fontSize:9,color:'#FFFFFF',fontWeight:'900',letterSpacing:.5},
  deviceIllustration:{width:83,height:83,borderRadius:22,backgroundColor:'#0B2537',borderWidth:1,borderColor:'#247D88',alignItems:'center',justifyContent:'center'},
  deviceIllustrationIcon:{fontSize:45,color:C.teal,fontWeight:'900'},deviceIllustrationLabel:{fontSize:9,color:'#B7D5E0',fontWeight:'900',letterSpacing:2},
  sectionHeadingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:5,marginBottom:10},
  homeSectionTitle:{fontSize:16,color:C.navy,fontWeight:'900'},homeAction:{fontSize:10,color:C.teal,fontWeight:'800'},homeMuted:{fontSize:9,color:C.muted},
  homeMetricsRow:{flexDirection:'row',gap:8,marginBottom:18},
  homeMetricCard:{flex:1,minHeight:112,backgroundColor:C.white,borderColor:C.border,borderWidth:1,borderRadius:17,padding:11,justifyContent:'center'},
  homeMetricIcon:{fontSize:20,color:C.teal},homeMetricValue:{fontSize:25,color:C.navy,fontWeight:'900',marginTop:7},homeMetricLabel:{fontSize:9,color:C.muted,marginTop:3},
  jawActivityCard:{backgroundColor:C.white,borderWidth:1,borderColor:C.border,borderRadius:20,padding:15,marginBottom:18},
  jawActivityHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},jawActivityTitle:{fontSize:13,color:C.navy,fontWeight:'900'},
  liveBadge:{flexDirection:'row',alignItems:'center',backgroundColor:C.soft,paddingHorizontal:8,paddingVertical:5,borderRadius:20},liveBadgeText:{fontSize:8,color:C.teal,fontWeight:'900'},
  jawSidesRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingVertical:18},jawSide:{alignItems:'center',flex:1},jawSideValue:{fontSize:27,color:C.teal,fontWeight:'900'},jawSideLabel:{fontSize:8,color:C.muted,fontWeight:'900',marginTop:4,letterSpacing:.7},
  jawCenter:{width:66,height:66,borderRadius:33,backgroundColor:'#103A4C',borderWidth:1,borderColor:'#147A86',alignItems:'center',justifyContent:'center'},jawCenterIcon:{fontSize:26,color:C.teal},jawCenterLabel:{fontSize:8,color:'#FFFFFF',fontWeight:'900'},jawFootnote:{fontSize:9,color:C.muted,lineHeight:15},
  featureCard:{flexDirection:'row',alignItems:'center',backgroundColor:C.white,borderWidth:1,borderColor:C.border,borderRadius:17,padding:13,marginBottom:9},featureIcon:{width:43,height:43,borderRadius:13,backgroundColor:'#123D4D',alignItems:'center',justifyContent:'center'},featureIconText:{fontSize:23,color:C.teal},featureCopy:{flex:1,marginLeft:12},featureTitle:{fontSize:13,color:C.navy,fontWeight:'900'},featureBody:{fontSize:10,color:C.muted,lineHeight:15,marginTop:4},featureArrow:{fontSize:25,color:C.teal,marginLeft:8},
  rehabBanner:{flexDirection:'row',alignItems:'center',backgroundColor:'#102F47',borderRadius:19,padding:17,marginBottom:13,borderWidth:1,borderColor:'#1C596B'},rehabKicker:{fontSize:8,color:'#73D8D5',fontWeight:'900',letterSpacing:1.1},rehabTitle:{fontSize:17,color:'#FFFFFF',fontWeight:'900',marginTop:7},rehabBody:{fontSize:10,color:'#BDD1DF',lineHeight:15,marginTop:5},rehabIcon:{fontSize:34,color:C.teal,marginLeft:10},
  shortcutGrid:{flexDirection:'row',flexWrap:'wrap',gap:9,marginBottom:12},shortcutCard:{width:'48%',backgroundColor:C.white,borderRadius:15,borderWidth:1,borderColor:C.border,padding:13},shortcutIcon:{fontSize:22,color:C.teal},shortcutTitle:{fontSize:11,color:C.navy,fontWeight:'800',marginTop:6},
  homeDisclaimer:{backgroundColor:'#0C2030',borderRadius:12,padding:12,borderWidth:1,borderColor:C.border},homeDisclaimerText:{fontSize:9,color:C.muted,lineHeight:15},
  headerAction:{width:38,height:38,borderRadius:19,backgroundColor:'#13364A',alignItems:'center',justifyContent:'center'},headerActionText:{fontSize:20,color:C.teal},

  header:{
    height:65,
    backgroundColor:C.bg,
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:17,
    gap:11,
    borderBottomWidth:1,
    borderColor:C.border
  },

  logo:{
    width:39,height:39,borderRadius:13,
    backgroundColor:C.navy,alignItems:'center',justifyContent:'center'
  },

  logoText:{fontSize:27,color:C.teal,fontWeight:'bold'},
  brand:{fontSize:16,color:C.navy,fontWeight:'900'},
  content:{flex:1,padding:16},

  greeting:{fontSize:13,color:C.teal,fontWeight:'800',marginBottom:5},
  heading:{fontSize:25,fontWeight:'900',color:C.navy},
  subtitle:{fontSize:13,color:C.muted,marginTop:5,marginBottom:15},
  small:{fontSize:11,color:C.muted,marginTop:5},

  card:{
    backgroundColor:C.white,borderRadius:18,padding:16,
    marginBottom:12,borderWidth:1,borderColor:C.border
  },

  hero:{borderColor:'#D8F0EA'},
  heroTitle:{fontSize:21,fontWeight:'900',color:C.navy,marginTop:13,lineHeight:29},
  section:{fontSize:17,fontWeight:'900',color:C.navy,marginTop:13,marginBottom:10},
  cardTitle:{fontSize:15,fontWeight:'800',color:C.navy,marginTop:5},
  body:{fontSize:13,color:C.muted,lineHeight:21,marginTop:8},

  tag:{alignSelf:'flex-start',paddingHorizontal:10,paddingVertical:6,borderRadius:20},
  tagText:{fontSize:10,color:C.aqua,fontWeight:'900'},

  button:{backgroundColor:C.teal,padding:14,borderRadius:13,alignItems:'center',marginTop:13},
  secondary:{backgroundColor:C.soft},
  danger:{backgroundColor:C.red},
  buttonText:{fontSize:13,fontWeight:'900',color:C.white},

  between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  row:{flexDirection:'row',gap:10},
  metric:{flex:1,alignItems:'center'},
  metricValue:{fontSize:23,fontWeight:'900'},

  categoryRow:{flexDirection:'row',gap:8,paddingVertical:10},
  category:{padding:10,borderRadius:20,backgroundColor:C.white,borderWidth:1,borderColor:C.border},
  categoryActive:{backgroundColor:C.navy,borderColor:C.navy},
  categoryText:{fontSize:11,color:C.muted,fontWeight:'700'},

  input:{
    backgroundColor:C.white,borderRadius:12,padding:12,
    borderWidth:1,borderColor:C.border,color:C.navy,marginTop:8
  },

  step:{flexDirection:'row',alignItems:'center',gap:12,marginVertical:9},
  stepCircle:{width:30,height:30,borderRadius:15,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  stepText:{color:C.aqua,fontWeight:'900'},

  videoBox:{
    height:125,backgroundColor:C.soft,borderRadius:14,
    alignItems:'center',justifyContent:'center'
  },

  videoThumb:{
    height:120,
    backgroundColor:C.navy,
    borderRadius:14,
    alignItems:'center',
    justifyContent:'center'
  },

  playIcon:{fontSize:37,color:C.teal,fontWeight:'900'},
  videoThumbText:{fontSize:10,color:C.white,fontWeight:'900',marginTop:8,letterSpacing:1},

  center:{alignItems:'center',justifyContent:'center'},
  timer:{fontSize:48,fontWeight:'900',color:C.navy,marginTop:15},
  gaugeNumber:{fontSize:38,fontWeight:'900',color:C.teal,marginVertical:12},

  barTrack:{height:9,backgroundColor:C.soft,borderRadius:10,overflow:'hidden',marginTop:10},
  barFill:{height:9,backgroundColor:C.teal,borderRadius:10},

  periodRow:{flexDirection:'row',gap:8,marginBottom:10},
  periodButton:{flex:1,padding:12,borderRadius:12,backgroundColor:C.soft,alignItems:'center'},
  periodActive:{backgroundColor:C.navy},
  periodText:{fontWeight:'800',color:C.navy},

  chart:{height:175,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-around',marginTop:20},
  chartColumn:{flex:1,alignItems:'center',height:'100%',justifyContent:'flex-end'},
  chartValue:{fontSize:9,color:C.muted,height:16},
  chartBarBackground:{height:120,width:19,backgroundColor:C.soft,borderRadius:8,justifyContent:'flex-end',overflow:'hidden'},
  chartBar:{width:'100%',backgroundColor:C.teal,borderRadius:8},
  chartLabel:{fontSize:10,color:C.muted,marginTop:8},

  avatar:{width:75,height:75,borderRadius:40,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  avatarText:{fontSize:30,color:C.aqua,fontWeight:'900'},

  message:{padding:13,borderRadius:15,marginVertical:6,maxWidth:'88%'},
  aiMessage:{backgroundColor:C.white,alignSelf:'flex-start',borderWidth:1,borderColor:C.border},
  userMessage:{backgroundColor:C.teal,alignSelf:'flex-end'},
  suggestion:{padding:12,backgroundColor:C.white,borderRadius:12,marginVertical:4},
  link:{color:C.aqua,fontSize:13,fontWeight:'800'},
  chatInput:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},
  send:{backgroundColor:C.teal,padding:14,borderRadius:12},

  nav:{
    height:70,backgroundColor:'#0B1D2B',borderTopWidth:1,borderColor:C.border,
    flexDirection:'row',alignItems:'center',justifyContent:'space-around'
  },
  navItem:{flex:1,alignItems:'center',justifyContent:'center'},
  navIcon:{fontSize:20,color:C.muted,fontWeight:'700'},
  navLabel:{fontSize:9,color:C.muted,marginTop:4},
  active:{color:C.teal,fontWeight:'900'},

  guardHero:{alignItems:'center',paddingVertical:25},
  guardIcon:{fontSize:56,color:C.teal,marginBottom:8},

  watchCard:{backgroundColor:'#102B49',alignItems:'center',paddingVertical:28},
  watchTime:{fontSize:43,fontWeight:'900',color:'#FFFFFF',marginTop:24,letterSpacing:1},
  watchDate:{fontSize:13,color:'#D6E3EF',marginTop:8},
  watchDivider:{height:1,backgroundColor:'#496078',alignSelf:'stretch',marginVertical:22},
  watchMetric:{flex:1,alignItems:'center'},
  watchMetricValue:{fontSize:19,fontWeight:'900',color:'#FFFFFF'},
  watchMetricLabel:{fontSize:10,color:'#D6E3EF',marginTop:5}
});
