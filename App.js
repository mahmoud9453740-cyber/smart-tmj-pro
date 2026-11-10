import { deviceManager } from './src/ble';

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView,
  StatusBar, StyleSheet, Switch, Alert, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSensorMonitor } from './src/ble/useSensorMonitor';
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
    query:'TMJ relaxed jaw position exercise'
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
    query:'TMJ controlled jaw opening exercise'
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
    query:'TMJ lateral jaw movement exercise'
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
    query:'masseter muscle massage TMJ'
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
    query:'temporalis muscle massage TMJ'
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
    query:'neck posture exercises TMJ'
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
    query:'TMJ protrusion exercise'
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
    query:'relaxation breathing exercise'
  }
];

const categories = [
  'All','Relaxation','Jaw Mobility','Muscle Relaxation','Neck & Posture'
];

// VERIFIED VIDEO AND EDUCATIONAL RESOURCE LINKS
const videoItems = [
  {
    id:'v1',
    title:'Jaw Relaxation & Resting Position',
    category:'Relaxation',
    description:'A video resource for learning a relaxed jaw position.',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=8wFSeYB9pN8'
  },
  {
    id:'v2',
    title:'Controlled Jaw Movement',
    category:'Jaw Mobility',
    description:'Guided jaw movement exercises.',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=vWLGF34qi3g'
  },
  {
    id:'v3',
    title:'TMJ Exercises – Phase 1',
    category:'Jaw Mobility',
    description:'Introductory TMJ exercise resource.',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=EM18snVgV_c'
  },
  {
    id:'v4',
    title:'TMJ Exercises – Phase 2',
    category:'Jaw Mobility',
    description:'Additional TMJ exercise resource.',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=MS4O2dbCJc8'
  },
  {
    id:'v5',
    title:'TMJ Massage Techniques',
    category:'Muscle Relaxation',
    description:'Video resource for jaw muscle massage.',
    type:'Direct video',
    url:'https://www.youtube.com/watch?v=o_mHqmmUgM8'
  },
  {
    id:'v6',
    title:'Masseter Self-Massage',
    category:'Muscle Relaxation',
    description:'Step-by-step educational resource about masseter massage.',
    type:'Clinical video page',
    url:'https://www.ptsakkinen.com/videos/t8iCnAUr4pU'
  },
  {
    id:'v7',
    title:'Stiff Jaw & Masseter Education',
    category:'Muscle Relaxation',
    description:'Additional educational video about jaw muscle tension.',
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
    description:'A collection of educational TMD resources.',
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

function Btn({title,onPress,secondary,danger}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[s.button,secondary&&s.secondary,danger&&s.danger]}
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

function ExercisesScreen({setPage}) {
  const [category,setCategory]=useState('All');
  const [search,setSearch]=useState('');

  const filtered=exerciseItems.filter(item=>
    (category==='All'||item.category===category) &&
    item.title.toLowerCase().includes(search.toLowerCase())
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

      <Section>{filtered.length} Exercises</Section>

      {filtered.map(item=>(
        <Card key={item.id}>
          <View style={s.between}>
            <Tag>{item.category}</Tag>
            <Text style={s.small}>{item.duration} min</Text>
          </View>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.body}>{item.description}</Text>
          <View style={s.between}>
            <Tag color={C.soft}>{item.level}</Tag>
            <Text style={s.small}>Educational guide</Text>
          </View>
          <Btn title="View Exercise Guide" secondary onPress={()=>setPage('exercise:'+item.id)}/>
        </Card>
      ))}

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

function SessionScreen({finish,exercise}) {
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

      <Section>Demo Biofeedback</Section>
      <Card>
        <Tag color="#FFF0DF">SIMULATED DATA ONLY</Tag>
        <Text style={s.cardTitle}>Masseter Activity</Text>
        <Text style={s.gaugeNumber}>{running?'42':'--'}</Text>
        <Bar value={running?42:0}/>
        <Text style={s.small}>No real EMG sensor is connected.</Text>
      </Card>

      <Card>
        <Text style={s.cardTitle}>Pressure Distribution</Text>
        <Text style={s.body}>
          Real pressure readings will be available after hardware integration.
        </Text>
      </Card>
    </ScrollView>
  );
}

// RESULTS

function ResultsScreen({sessions,monitor}) {
  const [period,setPeriod]=useState('Week');
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
  const monitoringEvents = Array.isArray(monitor && monitor.events) ? monitor.events : [];
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Heading>Results Dashboard</Heading>
      <Text style={s.subtitle}>Your saved practice statistics</Text>

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

function DayMode() {
  const [reminders,setReminders]=useState(true);
  const [awareness,setAwareness]=useState(true);

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

function NightMode({setPage,monitor}) {
  const readings = (monitor && monitor.readings) || {};
  const events = Array.isArray(monitor && monitor.events) ? monitor.events : [];
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
        body: JSON.stringify({message, context: aiContext || {}, history: messages.slice(-12).map(item => ({role: item.from === 'user' ? 'user' : 'model', text: item.text}))})
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
      <Text style={s.subtitle}>Your personal information</Text>

      <Card style={s.center}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>U</Text>
        </View>
        <Text style={s.cardTitle}>{profile.name||'Smart TMJ User'}</Text>
        <Text style={s.small}>Personal profile</Text>
      </Card>

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

// SETTINGS

function SettingsScreen({page,profile,setProfile}) {
  const [name,setName]=useState(profile.name||'');
  const [age,setAge]=useState(profile.age||'');

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
          <Btn
            title="Save Profile"
            onPress={()=>{
              setProfile({name,age});
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
  const [tab,setTab]=useState('Home');
  const [page,setPage]=useState('Home');

  const [sessions,setSessions]=useState([]);
  const [devices,setDevices]=useState(defaultDevices);
  const [profile,setProfile]=useState({name:'',age:''});
  const [loaded,setLoaded]=useState(false);
  const liveMonitor = useSensorMonitor();

  useEffect(()=>{
    let alive=true;

    async function load() {
      try {
        const saved=await AsyncStorage.getItem(KEY);

        if(saved) {
          const data=JSON.parse(saved);

          if(alive) {
            if(Array.isArray(data.sessions))
              setSessions(data.sessions);

            if(Array.isArray(data.devices)) {
              const merged=defaultDevices.map(d=>
                data.devices.find(x=>x.id===d.id)||d
              );
              setDevices(merged);
            }

            if(data.profile)
              setProfile(data.profile);
          }
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

    AsyncStorage.setItem(
      KEY,
      JSON.stringify({sessions,devices,profile})
    ).catch(e=>console.log('Save error',e));
  },[sessions,devices,profile,loaded]);

  function navigate(id) {
    if (id === 'More') id = 'Profile';
    setPage(id);
    if (tabs.some(x=>x.id===id)) setTab(id);
    else if (id === 'Night Mode') setTab('Night Mode');
    else if (id === 'Profile') setTab('More');
    else if (id === 'Devices' || id === 'Night Guard' || id === 'Smart Watch' || id === 'Day Mode' || id === 'Videos') setTab('More');
  }

  function finish(duration,exercise,assessment = {}) {
    const item={
      id:String(Date.now()),
      duration,
      exercise,
      timestamp:Date.now(),
      date:new Date().toLocaleString(),
      assessment
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
      return <ExercisesScreen setPage={navigate}/>;

    if(page==='Videos')
      return <VideosScreen/>;

    if(page.startsWith('exercise:')) {
      const item=exerciseItems.find(x=>x.id===page.split(':')[1]);
      if(item)return <ExerciseDetails item={item} setPage={navigate}/>;
    }

    if(page.startsWith('Session')) {
      const item=exerciseItems.find(x=>x.id===page.split(':')[1]);
      return <SessionScreen finish={finish} exercise={item}/>;
    }

    if(page==='Results')
      return <ResultsScreen sessions={sessions} monitor={liveMonitor}/>;

    if(page==='Devices')
      return <DevicesScreen devices={devices} setPage={navigate} monitor={liveMonitor}/>;

    if(page==='Night Guard')
      return <NightGuardScreen/>;

    if(page==='Smart Watch')
      return <SmartWatchScreen/>;

    if(page==='Day Mode')
      return <DayMode/>;

    if(page==='Night Mode')
      return <NightMode setPage={navigate} monitor={liveMonitor}/>;

    if(page==='AI')
      return <AssistantScreen aiContext={{
        profile,
        devices: devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          connected: Boolean(device.connected),
          connectionSource: device.connected ? 'app device state' : 'not connected'
        })),
        exerciseSessions: sessions.slice(-30),
        monitoring: {
          readings: liveMonitor.readings || {},
          events: Array.isArray(liveMonitor.events) ? liveMonitor.events.slice(-50) : [],
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
          level: item.level
        })),
        appCapabilities: {
          liveBluetoothTransport: 'native BLE scanning and pairing are not implemented in this build',
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
