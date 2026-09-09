import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ChevronRight, RotateCcw, Home, Check, X, Stethoscope, Trophy, Settings, User, ArrowRight, Sparkles } from 'lucide-react';

const LOGO = '/logo.jpg';

// ============ CASE DATA ============
// Each case: d = diagnosis, diff = e/m/h, c = 5 clues [PC, Hx, Exam, Labs, Special/Imaging]
const CASES = {
  'Cardiology': [
    { d: 'Anterior STEMI', diff: 'e', c: ['Crushing central chest pain for 1 hour, radiating to left arm', '54M smoker with type 2 diabetes, diaphoretic and nauseated', 'BP 100/70, HR 95, S4 gallop, chest clear', 'Troponin I 8200 ng/L, potassium 4.1', 'ECG: 3mm ST elevation in leads V2 to V5 with reciprocal changes'] },
    { d: 'Aortic stenosis', diff: 'e', c: ['Exertional breathlessness with two syncopal episodes', '78F, angina climbing one flight of stairs', 'Slow rising pulse, ejection systolic murmur radiating to carotids, soft second heart sound', 'ECG shows left ventricular hypertrophy', 'Echo: valve area 0.8 cm squared, peak gradient 65 mmHg'] },
    { d: 'Mitral stenosis', diff: 'm', c: ['Progressive breathlessness and one episode of haemoptysis', '40F, had rheumatic fever as a child in India', 'Malar flush, tapping apex beat, opening snap, low pitched mid-diastolic murmur', 'ECG: atrial fibrillation', 'Echo: mitral valve area 1.1 cm squared with thickened leaflets'] },
    { d: 'Infective endocarditis', diff: 'm', c: ['Fever and malaise for 3 weeks with weight loss', '32M intravenous drug user, recent dental extraction', 'New pansystolic murmur, splinter haemorrhages, Osler nodes on fingertips', 'Three sets of blood cultures grow Streptococcus viridans', 'Transoesophageal echo: 12mm vegetation on mitral valve'] },
    { d: 'Hypertrophic cardiomyopathy', diff: 'h', c: ['Sudden collapse during football training', '18M, uncle died suddenly aged 30', 'Ejection systolic murmur louder on Valsalva, jerky pulse', 'ECG: deep Q waves inferolaterally, voltage criteria for LVH', 'Echo: asymmetric septal hypertrophy 22mm with systolic anterior motion of mitral valve'] },
    { d: 'Acute pericarditis', diff: 'e', c: ['Sharp central chest pain, worse lying flat, better sitting forward', '25M with viral upper respiratory infection last week', 'Pericardial friction rub audible at left sternal edge', 'Troponin mildly raised, CRP 80', 'ECG: widespread saddle-shaped ST elevation with PR depression'] },
    { d: 'Cardiac tamponade', diff: 'm', c: ['Breathless and dizzy since this morning', 'Anterior MI 5 days ago, currently on warfarin for AF', 'BP 85/60, raised JVP, muffled heart sounds, pulsus paradoxus 15mmHg', 'Chest X-ray shows globular cardiac silhouette', 'Echo: large pericardial effusion with right ventricular diastolic collapse'] },
    { d: 'Pulmonary embolism', diff: 'm', c: ['Sudden pleuritic chest pain and breathlessness', '35F on combined oral contraceptive, recent 10-hour flight, unilateral calf swelling', 'HR 115, RR 24, SpO2 91% on air, chest clear', 'D-dimer 3200, ABG shows type 1 respiratory failure', 'CT pulmonary angiogram: bilateral segmental filling defects'] },
    { d: 'Aortic dissection', diff: 'h', c: ['Sudden tearing chest pain radiating to the back', '60M with hypertension, tall with long limbs', 'BP differential of 30 mmHg between arms, early diastolic murmur', 'Chest X-ray shows widened mediastinum', 'CT aorta: type A dissection extending into aortic arch'] },
    { d: 'Atrial fibrillation', diff: 'e', c: ['Palpitations and breathlessness for 6 hours', '70M with poorly controlled hypertension', 'Irregularly irregular pulse at 140, apex-radial deficit', 'TSH normal, potassium 4.0', 'ECG: absent P waves, irregular narrow complex QRS at 138'] },
    { d: 'Complete heart block', diff: 'm', c: ['Dizzy spells and one syncopal episode', '82M taking bisoprolol for hypertension', 'HR 38 regular, cannon a waves in JVP', 'Troponin negative, electrolytes normal', 'ECG: P waves and QRS complexes dissociated, ventricular rate 38'] },
    { d: 'Wolff-Parkinson-White syndrome', diff: 'h', c: ['Recurrent palpitations with one collapse', '22M, otherwise fit and well', 'Tachycardia 200 during episode, terminated with vagal manoeuvres', 'Bloods unremarkable', 'Resting ECG: short PR interval, delta wave, widened QRS'] },
    { d: 'Congestive heart failure', diff: 'e', c: ['Progressive breathlessness, ankle swelling, waking gasping for air at night', '68F with prior anterior MI 3 years ago', 'Bibasal crackles, raised JVP, S3 gallop, pitting oedema to knees', 'BNP 1800, mild acute kidney injury', 'Echo: ejection fraction 28% with global hypokinesia'] },
    { d: 'Constrictive pericarditis', diff: 'h', c: ['Fatigue, abdominal swelling and ankle oedema over 6 months', 'Treated pulmonary TB 15 years ago', 'Raised JVP with Kussmaul sign, pericardial knock, ascites', 'ECG shows low voltage complexes', 'CT chest: thickened calcified pericardium'] },
    { d: 'Takotsubo cardiomyopathy', diff: 'h', c: ['Chest pain and breathlessness the day after her husband died', '65F with no cardiac history', 'Mild pulmonary oedema, HR 100', 'Troponin mildly raised, ECG shows anterior T-wave inversion', 'Coronary angiogram normal, ventriculogram shows apical ballooning'] },
  ],
  'Respiratory': [
    { d: 'Community acquired pneumonia', diff: 'e', c: ['Fever, productive cough with rusty sputum for 3 days', '60M smoker, previously well', 'Temp 39, RR 28, bronchial breathing at right base with dullness to percussion', 'WCC 18, CRP 240, urea 8', 'Chest X-ray: right lower lobe consolidation'] },
    { d: 'Chronic obstructive pulmonary disease exacerbation', diff: 'e', c: ['Increased breathlessness and green sputum for 4 days', '68M with 50 pack-year history, on tiotropium', 'Barrel chest, prolonged expiratory phase, bilateral wheeze', 'ABG: pH 7.31, pCO2 8.2, pO2 7.4, HCO3 32', 'Chest X-ray: hyperinflation, no consolidation'] },
    { d: 'Asthma exacerbation', diff: 'e', c: ['Acute breathlessness and wheeze since this morning', '22F with childhood asthma, ran out of inhalers', 'RR 30, unable to complete sentences, widespread polyphonic wheeze', 'Peak flow 180 (best 450), SpO2 92%', 'ABG: pH 7.45, pCO2 3.8, pO2 9.0'] },
    { d: 'Tension pneumothorax', diff: 'm', c: ['Sudden severe breathlessness after stabbing to right chest', '28M following assault', 'Tracheal deviation to left, absent breath sounds right, hyper-resonant, hypotensive', 'SpO2 84%', 'Clinical diagnosis, no time for imaging'] },
    { d: 'Primary spontaneous pneumothorax', diff: 'm', c: ['Sudden right-sided pleuritic chest pain and mild breathlessness', '22M tall thin smoker', 'Reduced breath sounds right upper zone, hyper-resonant percussion', 'SpO2 96%, observations otherwise normal', 'Chest X-ray: 3cm rim of air at right apex, no mediastinal shift'] },
    { d: 'Pulmonary tuberculosis', diff: 'm', c: ['Chronic cough with haemoptysis, night sweats, weight loss over 3 months', '35M recently arrived from Somalia', 'Cachectic, crackles at right apex', 'Sputum smear: acid-fast bacilli seen', 'Chest X-ray: cavitating lesion in right upper lobe'] },
    { d: 'Lung cancer', diff: 'm', c: ['Persistent cough with haemoptysis and 8kg weight loss over 2 months', '68M ex-smoker with 40 pack-year history', 'Clubbing, right supraclavicular lymphadenopathy, dullness right base', 'Hyponatraemia 128', 'CT chest: 4cm right hilar mass with mediastinal lymphadenopathy'] },
    { d: 'Idiopathic pulmonary fibrosis', diff: 'h', c: ['Progressive breathlessness on exertion and dry cough over 18 months', '70M, no smoking or occupational history', 'Fine bibasal end-inspiratory crackles, clubbing', 'Spirometry: restrictive pattern with reduced TLCO', 'HRCT: peripheral basal reticulation with honeycombing'] },
    { d: 'Sarcoidosis', diff: 'm', c: ['Dry cough, fatigue and painful red shins for 6 weeks', '30F Afro-Caribbean woman', 'Erythema nodosum on shins, no lymphadenopathy palpable', 'Serum ACE raised, calcium 2.75', 'Chest X-ray: bilateral hilar lymphadenopathy'] },
    { d: 'Bronchiectasis', diff: 'm', c: ['Daily productive cough with copious purulent sputum for many years', '55F, recurrent chest infections since childhood pertussis', 'Coarse inspiratory crackles at both bases, clubbing', 'Sputum grows Pseudomonas aeruginosa', 'HRCT: dilated thick-walled airways with signet ring sign'] },
    { d: 'Legionella pneumonia', diff: 'h', c: ['Fever, dry cough, confusion and diarrhoea for 5 days', '62M returned from Spanish hotel holiday', 'Temp 39.5, crackles left base, confused', 'Sodium 128, LFTs deranged, urinary antigen positive', 'Chest X-ray: patchy left lower zone consolidation'] },
    { d: 'Obstructive sleep apnoea', diff: 'm', c: ['Excessive daytime sleepiness and morning headaches', '52M, BMI 38, wife reports loud snoring and witnessed apnoeas', 'Crowded oropharynx, neck circumference 46cm', 'Epworth score 18', 'Overnight polysomnography: AHI 42 events per hour'] },
    { d: 'Cystic fibrosis', diff: 'h', c: ['Recurrent chest infections, chronic cough, poor weight gain since childhood', '19M, delayed puberty, steatorrhoea', 'Clubbing, coarse crackles throughout, low BMI', 'Sweat chloride 78 mmol/L', 'Genetic testing: homozygous delta F508'] },
    { d: 'Pulmonary hypertension', diff: 'h', c: ['Progressive breathlessness and exertional syncope', '45F with limited scleroderma', 'Loud pulmonary component of second heart sound, right ventricular heave, raised JVP', 'ECG right axis deviation, echo estimated PASP 65mmHg', 'Right heart catheter: mean PAP 42 mmHg'] },
    { d: 'Empyema', diff: 'm', c: ['Persistent fever and pleuritic chest pain despite 5 days of antibiotics for pneumonia', '58M diabetic', 'Temp 38.8, stony dull percussion at right base with absent breath sounds', 'CRP 320, WCC 22', 'Pleural aspirate: pH 6.9, pus with Streptococcus milleri'] },
  ],
  'Neurology': [
    { d: 'Ischaemic stroke', diff: 'e', c: ['Sudden right-sided weakness and slurred speech 90 minutes ago', '75M with AF not on anticoagulation', 'Right hemiparesis, right facial droop, expressive dysphasia', 'BM 6.2, ECG confirms AF', 'CT head: no haemorrhage, dense left MCA sign'] },
    { d: 'Subarachnoid haemorrhage', diff: 'm', c: ['Sudden severe occipital headache described as thunderclap, worst ever', '52F with polycystic kidney disease, hypertensive', 'GCS 14, neck stiffness, photophobia, no focal signs', 'CT head negative at 12 hours', 'Lumbar puncture: xanthochromia positive'] },
    { d: 'Bacterial meningitis', diff: 'm', c: ['Fever, severe headache, neck stiffness and drowsiness for 12 hours', '19M university student in halls of residence', 'Temp 39.5, GCS 13, Kernig sign positive, non-blanching purpuric rash', 'CRP 280, WCC 22', 'CSF: turbid, neutrophils 2000, protein 3.2, glucose 1.1, Gram-negative diplococci'] },
    { d: 'Migraine with aura', diff: 'e', c: ['Recurrent throbbing unilateral headaches preceded by zigzag visual disturbance', '28F, headaches worse premenstrually', 'Neurological examination normal between attacks', 'Bloods normal', 'CT head normal'] },
    { d: 'Multiple sclerosis', diff: 'm', c: ['Blurred vision in right eye with pain on eye movement, resolving over 3 weeks', '28F, previous episode of numb legs 2 years ago that resolved', 'Right relative afferent pupillary defect, brisk reflexes, upgoing plantar right', 'Bloods unremarkable', 'MRI brain: multiple periventricular white matter lesions, some enhancing'] },
    { d: 'Parkinson disease', diff: 'e', c: ['Tremor in right hand and slowness over 12 months', '68M, wife notes reduced facial expression and smaller handwriting', 'Resting pill-rolling tremor right hand, cogwheel rigidity, hypomimia, shuffling gait', 'Bloods and CT head normal', 'DaTSCAN: reduced putaminal dopamine uptake left greater than right'] },
    { d: 'Guillain-Barre syndrome', diff: 'm', c: ['Ascending weakness starting in feet over 5 days, now involves hands', '45M, gastroenteritis 2 weeks ago with Campylobacter', 'Symmetrical flaccid weakness legs greater than arms, absent reflexes, sensation intact', 'FVC 2.2L and falling', 'Nerve conduction: demyelinating pattern; CSF protein 2.1, cells 2'] },
    { d: 'Myasthenia gravis', diff: 'm', c: ['Fluctuating drooping eyelids and double vision, worse at end of day', '32F, difficulty swallowing at dinner', 'Fatigable ptosis on sustained upgaze, diplopia on lateral gaze', 'Anti-acetylcholine receptor antibodies positive', 'EMG: decremental response on repetitive nerve stimulation'] },
    { d: 'Trigeminal neuralgia', diff: 'e', c: ['Brief severe stabbing pain in right cheek triggered by shaving and cold wind', '65F', 'Trigger point right V2 distribution, cranial nerves otherwise normal', 'Bloods normal', 'MRI brain: right superior cerebellar artery contacting trigeminal nerve'] },
    { d: 'Motor neurone disease', diff: 'h', c: ['Progressive weakness, muscle twitching and slurred speech over 8 months', '58M, hand weakness first noticed while opening jars', 'Fasciculations tongue and limbs, wasted small hand muscles, brisk reflexes, upgoing plantars', 'EMG shows widespread denervation', 'Diagnosis by clinical and electrophysiological criteria; no sensory involvement'] },
    { d: 'Temporal arteritis', diff: 'm', c: ['New unilateral temporal headache with jaw claudication and scalp tenderness', '72F, one episode of transient visual loss right eye', 'Tender thickened non-pulsatile right temporal artery', 'ESR 98, CRP 140, platelets 550', 'Temporal artery biopsy: giant cells and intimal thickening'] },
    { d: 'Normal pressure hydrocephalus', diff: 'h', c: ['Cognitive decline, urinary incontinence and unsteady gait over 12 months', '76M, wife noticed magnetic gait first', 'Broad-based shuffling gait, mild bradyphrenia, MMSE 22', 'Bloods normal', 'CT head: ventriculomegaly out of proportion to sulcal atrophy'] },
    { d: 'Cluster headache', diff: 'm', c: ['Severe unilateral right retro-orbital pain lasting 90 minutes, occurs nightly for 3 weeks', '38M smoker', 'During attack: right eye lacrimation, ptosis, nasal congestion, agitated pacing', 'Bloods normal', 'MRI brain normal'] },
    { d: 'Herpes simplex encephalitis', diff: 'h', c: ['Fever, confusion and one focal seizure over 2 days', '55F, personality change noted by family', 'Temp 38.5, disoriented, expressive dysphasia', 'CSF: lymphocytes 120, protein 0.9, glucose normal, HSV PCR positive', 'MRI brain: bilateral temporal lobe hyperintensity'] },
    { d: 'Wernicke encephalopathy', diff: 'm', c: ['Confusion, unsteadiness and double vision over 3 days', '52M with chronic alcohol dependence, poor nutrition', 'Confused, horizontal nystagmus, bilateral lateral rectus palsy, ataxic gait', 'FBC macrocytic, LFTs deranged', 'MRI brain: symmetrical mamillary body hyperintensity'] },
  ],
  'Gastroenterology': [
    { d: 'Acute appendicitis', diff: 'e', c: ['Central abdominal pain migrating to right iliac fossa over 18 hours, anorexia, vomiting', '22M previously well', 'Temp 37.9, tenderness and guarding at McBurney point, Rovsing sign positive', 'WCC 15, CRP 80', 'CT abdomen: dilated appendix 12mm with peri-appendiceal fat stranding'] },
    { d: 'Acute cholecystitis', diff: 'e', c: ['Severe right upper quadrant pain for 24 hours, fever, nausea', '48F, BMI 34, previous biliary colic', 'Temp 38.2, Murphy sign positive, tender right upper quadrant', 'WCC 16, ALP 180, bilirubin normal', 'Ultrasound: thickened gallbladder wall, pericholecystic fluid, stones'] },
    { d: 'Ascending cholangitis', diff: 'm', c: ['Right upper quadrant pain, fever with rigors and jaundice', '68M with known common bile duct stones', 'Temp 39.5, BP 90/60, jaundiced, tender right upper quadrant', 'Bilirubin 180, ALP 420, WCC 22, CRP 300', 'MRCP: dilated CBD with obstructing stone'] },
    { d: 'Acute pancreatitis', diff: 'e', c: ['Severe epigastric pain radiating to back, vomiting for 12 hours', '55M with heavy alcohol intake', 'Epigastric tenderness, reduced bowel sounds, mildly icteric', 'Amylase 1200, lipase 4000, calcium 2.05, glucose 12', 'CT abdomen: oedematous pancreas without necrosis'] },
    { d: 'Peptic ulcer disease with perforation', diff: 'm', c: ['Sudden onset severe epigastric pain now generalised, 4 hours ago', '62M on long-term diclofenac for arthritis', 'Rigid board-like abdomen, absent bowel sounds, tachycardic', 'WCC 18, lactate 3.2', 'Erect chest X-ray: free air under both hemidiaphragms'] },
    { d: 'Ulcerative colitis', diff: 'm', c: ['Bloody diarrhoea 8 times per day with urgency and tenesmus for 3 weeks', '24F, no travel or antibiotic use', 'Mild left iliac fossa tenderness, PR exam blood on glove', 'CRP 65, albumin 28, faecal calprotectin 890', 'Colonoscopy: continuous inflammation from rectum with loss of vascular pattern and ulceration'] },
    { d: 'Crohn disease', diff: 'm', c: ['Colicky right iliac fossa pain, non-bloody diarrhoea, weight loss over 6 months', '25M, one episode of perianal abscess', 'RIF mass palpable, anal skin tags, aphthous mouth ulcers', 'CRP 45, B12 low, faecal calprotectin 620', 'MRI small bowel: skip lesions in terminal ileum with strictures'] },
    { d: 'Coeliac disease', diff: 'e', c: ['Chronic diarrhoea, bloating and iron-deficiency anaemia', '30F with type 1 diabetes and hypothyroidism', 'BMI 19, angular stomatitis, no abdominal tenderness', 'Hb 95 microcytic, ferritin 8, anti-TTG strongly positive', 'Duodenal biopsy: villous atrophy with intraepithelial lymphocytes'] },
    { d: 'Irritable bowel syndrome', diff: 'e', c: ['Alternating diarrhoea and constipation with bloating for 2 years, relieved by defecation', '28F, symptoms worse with stress', 'Abdomen soft, mildly tender left iliac fossa, no mass', 'FBC, CRP, coeliac serology and faecal calprotectin all normal', 'Colonoscopy normal'] },
    { d: 'Diverticulitis', diff: 'e', c: ['Constant left iliac fossa pain and fever for 3 days, altered bowel habit', '68M, known diverticular disease', 'Temp 38.3, tender left iliac fossa with guarding, no rebound', 'WCC 14, CRP 120', 'CT abdomen: sigmoid diverticula with pericolonic fat stranding, no abscess'] },
    { d: 'Bowel obstruction', diff: 'm', c: ['Colicky central abdominal pain, vomiting and absolute constipation for 24 hours', '58F, previous open hysterectomy', 'Distended abdomen with tinkling bowel sounds, midline scar', 'Lactate 2.1, urea 9', 'CT abdomen: dilated small bowel loops with transition point and adhesive band'] },
    { d: 'Upper GI bleed from oesophageal varices', diff: 'm', c: ['Two episodes of coffee-ground vomit and one large fresh haematemesis', '55M with alcoholic liver disease', 'BP 90/55, HR 115, spider naevi, splenomegaly, ascites, melaena on PR', 'Hb 72, INR 1.8, urea 18', 'Endoscopy: three columns of grade 2 varices with active bleeding, banded'] },
    { d: 'Autoimmune hepatitis', diff: 'h', c: ['Fatigue and jaundice over 6 weeks', '35F with hypothyroidism and vitiligo', 'Jaundiced, hepatomegaly, no stigmata of chronic liver disease', 'ALT 850, ALP 120, IgG 32, ANA and anti-smooth muscle antibody positive', 'Liver biopsy: interface hepatitis with plasma cell infiltrate'] },
    { d: 'Primary biliary cholangitis', diff: 'h', c: ['Fatigue and generalised itching for 8 months', '52F', 'Xanthelasma, mild hepatomegaly, excoriations', 'ALP 480, GGT 320, bilirubin 22, anti-mitochondrial antibody positive', 'Liver biopsy: granulomatous destruction of intralobular bile ducts'] },
    { d: 'Achalasia', diff: 'h', c: ['Progressive dysphagia to solids and liquids for 12 months, regurgitation of undigested food', '48M, weight loss 6kg', 'No lymphadenopathy, abdomen normal', 'Bloods normal', 'Barium swallow: dilated oesophagus with birds beak tapering; manometry confirms failure of LOS relaxation'] },
  ],
  'Endocrinology': [
    { d: 'Diabetic ketoacidosis', diff: 'e', c: ['Vomiting, abdominal pain and drowsiness over 24 hours', '22F with type 1 diabetes, ran out of insulin', 'Kussmaul respiration, ketotic breath, dry mucous membranes, HR 118', 'Glucose 28, ketones 5.8, ABG pH 7.15, HCO3 8', 'Urine dip: ketones 4+, glucose 4+'] },
    { d: 'Hyperosmolar hyperglycaemic state', diff: 'm', c: ['Progressive drowsiness, polyuria and dehydration over 5 days', '78F with type 2 diabetes, recent chest infection', 'Profoundly dehydrated, GCS 12, no ketotic breath, HR 110', 'Glucose 48, ketones 0.6, osmolality 340, sodium 155', 'ABG: pH 7.34, HCO3 22'] },
    { d: 'Hypoglycaemia', diff: 'e', c: ['Sudden confusion, sweating and tremor', '68M on gliclazide, missed lunch', 'Sweaty, confused, HR 105, otherwise unremarkable', 'BM 2.1', 'Resolves rapidly with 50ml of 20% dextrose IV'] },
    { d: 'Thyrotoxicosis (Graves disease)', diff: 'e', c: ['Weight loss, palpitations, heat intolerance and tremor over 3 months', '32F, family history of thyroid disease', 'Fine tremor, warm sweaty palms, diffuse smooth goitre with bruit, lid lag, exophthalmos', 'TSH under 0.01, free T4 42, TSH receptor antibodies positive', 'Uptake scan: diffuse increased uptake'] },
    { d: 'Hypothyroidism', diff: 'e', c: ['Fatigue, weight gain, cold intolerance and constipation over 6 months', '55F with vitiligo', 'Bradycardia 55, dry skin, delayed relaxation of ankle reflexes', 'TSH 78, free T4 5, cholesterol raised, anti-TPO antibodies positive', 'Diagnosis on biochemistry'] },
    { d: 'Cushing syndrome', diff: 'm', c: ['Weight gain, easy bruising, muscle weakness and mood changes over 12 months', '42F with new-onset diabetes and hypertension', 'Central obesity, moon face, buffalo hump, purple abdominal striae, proximal myopathy', 'Overnight dexamethasone suppression test: fails to suppress; 24h urinary cortisol raised', 'Pituitary MRI: 8mm adenoma'] },
    { d: 'Addison disease', diff: 'm', c: ['Fatigue, weight loss, salt craving and dizziness on standing for 4 months', '38F with type 1 diabetes and vitiligo', 'Hyperpigmentation of palmar creases and buccal mucosa, postural drop 30mmHg', 'Sodium 128, potassium 5.6, glucose 3.2', 'Short synacthen test: cortisol fails to rise; ACTH raised; adrenal antibodies positive'] },
    { d: 'Phaeochromocytoma', diff: 'h', c: ['Paroxysmal episodes of headache, palpitations and sweating for 6 months', '45M with resistant hypertension', 'BP 195/115, otherwise normal examination', '24h urinary metanephrines markedly raised', 'MRI abdomen: 4cm right adrenal mass'] },
    { d: 'Primary hyperaldosteronism (Conn syndrome)', diff: 'h', c: ['Muscle weakness, cramps and hypertension resistant to 3 agents', '48M', 'BP 175/105, no other findings', 'Potassium 2.9, sodium 145, aldosterone-renin ratio raised', 'CT adrenals: 15mm left adrenal adenoma'] },
    { d: 'Diabetes insipidus', diff: 'h', c: ['Excessive thirst and passing 8 litres of urine per day for 4 weeks', '35M with recent traumatic brain injury', 'Mildly dehydrated, otherwise unremarkable', 'Serum osmolality 305, urine osmolality 180, sodium 148', 'Water deprivation test: urine concentrates after desmopressin (cranial DI)'] },
    { d: 'Acromegaly', diff: 'h', c: ['Enlarging hands and feet, coarse facial features, sweating over 3 years', '48M with new type 2 diabetes and hypertension', 'Prognathism, spade-like hands, bitemporal hemianopia', 'IGF-1 markedly raised, oral glucose tolerance test fails to suppress growth hormone', 'Pituitary MRI: 14mm macroadenoma'] },
    { d: 'Prolactinoma', diff: 'm', c: ['Amenorrhoea for 9 months with galactorrhoea', '28F, negative pregnancy test', 'Galactorrhoea on breast expression, visual fields intact', 'Prolactin 4200, TSH normal, pregnancy test negative', 'Pituitary MRI: 7mm microadenoma'] },
    { d: 'Primary hyperparathyroidism', diff: 'm', c: ['Fatigue, low mood, renal colic and constipation over 6 months', '58F', 'No specific findings', 'Calcium 2.95, phosphate 0.7, PTH 18 (raised)', 'Sestamibi scan: right inferior parathyroid adenoma'] },
    { d: 'Subacute (De Quervain) thyroiditis', diff: 'h', c: ['Tender neck, palpitations and low-grade fever 3 weeks after viral URTI', '35F', 'Tender diffuse goitre, mild tremor', 'TSH low, T4 raised, ESR 65, thyroid antibodies negative', 'Uptake scan: markedly reduced uptake'] },
    { d: 'Congenital adrenal hyperplasia', diff: 'h', c: ['Ambiguous genitalia noted at birth', 'Newborn female infant, dehydrated at day 8', 'Clitoromegaly, fused labia, dehydrated', 'Sodium 128, potassium 6.2, 17-hydroxyprogesterone markedly raised', 'Diagnosis: 21-hydroxylase deficiency confirmed on genetic testing'] },
  ],
  'Infectious Diseases': [
    { d: 'Falciparum malaria', diff: 'm', c: ['Fever with rigors, headache and myalgia for 5 days', '32M returned from Nigeria 2 weeks ago, took no prophylaxis', 'Temp 39.8, mildly jaundiced, splenomegaly', 'Hb 92, platelets 65, bilirubin 45, parasitaemia 4%', 'Blood film: ring forms of Plasmodium falciparum'] },
    { d: 'Enteric fever (typhoid)', diff: 'm', c: ['Progressive fever, headache, abdominal pain and constipation for 10 days', '25F returned from India 3 weeks ago', 'Temp 39.5, relative bradycardia, splenomegaly, rose spots on trunk', 'WCC 4.2, ALT 85', 'Blood cultures: Salmonella typhi'] },
    { d: 'Dengue fever', diff: 'm', c: ['High fever, severe retro-orbital pain and myalgia for 4 days, now with rash', '30M returned from Thailand 5 days ago', 'Temp 39.2, macular rash trunk, positive tourniquet test', 'Platelets 65, ALT 180, haematocrit rising', 'NS1 antigen positive; IgM positive'] },
    { d: 'HIV seroconversion illness', diff: 'h', c: ['Fever, sore throat, rash and myalgia for 10 days', '28M, recent unprotected sex with new male partner', 'Temp 38.5, generalised maculopapular rash, cervical lymphadenopathy, mouth ulcers', 'Lymphopenia, mildly deranged LFTs', 'HIV combined antigen/antibody test positive; viral load 2.4 million copies/mL'] },
    { d: 'Tuberculous meningitis', diff: 'h', c: ['Insidious headache, low-grade fever, personality change and drowsiness over 3 weeks', '38M from Somalia, HIV positive, CD4 120', 'Temp 37.8, GCS 13, cranial nerve VI palsy right, mild neck stiffness', 'CSF: lymphocytes 220, protein 3.8, glucose 1.2 (paired serum 5.5)', 'CSF PCR positive for M. tuberculosis'] },
    { d: 'Infectious mononucleosis', diff: 'e', c: ['Sore throat, fever and profound fatigue for 10 days', '19F university student', 'Temp 38.2, exudative tonsillitis, cervical and axillary lymphadenopathy, splenomegaly', 'Atypical lymphocytes on blood film, ALT 120', 'Monospot positive; EBV VCA IgM positive'] },
    { d: 'Cellulitis', diff: 'e', c: ['Hot, red, swollen right lower leg with fever for 3 days', '65M with venous eczema', 'Temp 38.4, erythema and warmth from ankle to knee, no crepitus', 'WCC 14, CRP 180', 'Clinical diagnosis; blood cultures grow group A Streptococcus'] },
    { d: 'Clostridioides difficile colitis', diff: 'm', c: ['Profuse watery diarrhoea 10 times per day, abdominal cramps for 4 days', '78F, recent 7-day course of co-amoxiclav', 'Temp 38, tender abdomen, dehydrated', 'WCC 22, albumin 25, lactate 2.1', 'Stool C. difficile toxin PCR positive'] },
    { d: 'Lyme disease', diff: 'm', c: ['Expanding red rash on thigh with central clearing, malaise, arthralgia', '35F, hiking in New Forest 3 weeks ago', 'Erythema migrans 12cm on right thigh, no joint swelling', 'ELISA Lyme IgM positive, immunoblot confirms', 'Clinical and serological diagnosis'] },
    { d: 'Necrotising fasciitis', diff: 'h', c: ['Rapidly progressive severe pain in left leg out of proportion to skin findings', '55M with type 2 diabetes, minor cut 3 days ago', 'Erythema with dusky patches, crepitus, skin anaesthesia, systemically unwell', 'WCC 26, CRP 380, lactate 4.5', 'X-ray shows gas in soft tissues; surgical exploration confirms'] },
    { d: 'Meningococcal septicaemia', diff: 'm', c: ['Fever, headache and rapidly spreading rash over 6 hours', '17M, previously well', 'Temp 39.5, BP 85/50, non-blanching purpuric rash on trunk and limbs', 'Lactate 4.2, WCC 22, INR 1.6', 'Blood PCR positive for Neisseria meningitidis serogroup B'] },
    { d: 'Pneumocystis jirovecii pneumonia', diff: 'h', c: ['Progressive breathlessness, dry cough and fever over 3 weeks', '38M with new HIV diagnosis, CD4 count 40', 'Tachypnoeic, SpO2 88% on air, desaturates on exertion, clear chest', 'LDH 620, ABG type 1 respiratory failure', 'HRCT: bilateral perihilar ground-glass opacities; BAL confirms P. jirovecii'] },
    { d: 'Toxoplasmosis (cerebral)', diff: 'h', c: ['Headache, focal seizure and right-sided weakness over 2 weeks', '42M with HIV, CD4 60, not on prophylaxis', 'Right hemiparesis, no meningism', 'Toxoplasma IgG positive', 'MRI brain: multiple ring-enhancing lesions with mass effect'] },
    { d: 'Leptospirosis', diff: 'h', c: ['Fever, myalgia, jaundice and reduced urine output over 6 days', '28M kayaker on stagnant water 2 weeks ago', 'Temp 38.7, jaundiced, conjunctival suffusion, tender calves', 'Bilirubin 120, creatinine 320, CK 4500, platelets 60', 'Leptospira MAT titre positive'] },
    { d: 'Herpes zoster (shingles)', diff: 'e', c: ['Painful vesicular rash on left chest wall for 3 days, preceded by 5 days of burning', '68M', 'Grouped vesicles on erythematous base in left T5 dermatome, not crossing midline', 'Bloods unremarkable', 'Clinical diagnosis'] },
  ],
  'Rheumatology': [
    { d: 'Rheumatoid arthritis', diff: 'e', c: ['Symmetrical joint pain and stiffness in hands and feet, morning stiffness lasting 2 hours, for 4 months', '45F, fatigue and low mood', 'Swollen tender MCPs and PIPs bilaterally, ulnar deviation early, positive MTP squeeze test', 'RF positive, anti-CCP strongly positive, CRP 45', 'Hand X-rays: peri-articular osteopenia and early erosions at MCPs'] },
    { d: 'Systemic lupus erythematosus', diff: 'm', c: ['Fatigue, joint pains, hair loss and facial rash worse in sun for 6 months', '28F Afro-Caribbean, one previous miscarriage', 'Malar rash sparing nasolabial folds, oral ulcers, tender wrists and knees without effusion', 'ANA 1:1280, anti-dsDNA positive, low complement C3 and C4, urine protein positive', 'Renal biopsy: class IV lupus nephritis'] },
    { d: 'Ankylosing spondylitis', diff: 'm', c: ['Insidious lower back pain and morning stiffness lasting 90 minutes, improving with exercise, for 12 months', '24M, family history in father', 'Reduced lumbar flexion (Schober test 2cm), reduced chest expansion, tender sacroiliac joints', 'HLA-B27 positive, CRP 32', 'MRI SI joints: bilateral bone marrow oedema and erosions'] },
    { d: 'Gout', diff: 'e', c: ['Acute severe pain, swelling and redness of right first MTP joint overnight', '55M with hypertension, obesity and heavy beer intake', 'Hot swollen red first MTP with exquisite tenderness, unable to bear weight', 'Uric acid 520, CRP 80', 'Joint aspirate: negatively birefringent needle-shaped crystals'] },
    { d: 'Pseudogout', diff: 'm', c: ['Sudden painful swollen right knee for 2 days', '78F', 'Hot swollen right knee with large effusion, restricted range of movement', 'CRP 65, uric acid normal', 'X-ray: chondrocalcinosis; aspirate shows positively birefringent rhomboid crystals'] },
    { d: 'Polymyalgia rheumatica', diff: 'e', c: ['Bilateral shoulder and hip girdle pain and stiffness for 6 weeks, worse in morning', '72F', 'No true weakness, painful restricted shoulder abduction bilaterally', 'ESR 78, CRP 65, CK normal', 'Dramatic response to prednisolone 15mg daily within 48 hours'] },
    { d: 'Giant cell arteritis', diff: 'm', c: ['New right-sided headache with scalp tenderness and jaw claudication', '75F, one episode of transient monocular vision loss right eye', 'Tender thickened right temporal artery with reduced pulsation', 'ESR 105, CRP 180, platelets 580', 'Temporal artery biopsy: giant cells with intimal thickening'] },
    { d: 'Systemic sclerosis (limited)', diff: 'h', c: ['Raynaud phenomenon for 8 years, now with digital ulcers, heartburn and taut skin over fingers', '52F', 'Sclerodactyly, telangiectasia on face and hands, calcinosis over knuckles', 'ANA positive, anti-centromere antibody positive', 'Nailfold capillaroscopy: dilated capillary loops'] },
    { d: 'Granulomatosis with polyangiitis', diff: 'h', c: ['Chronic sinusitis, epistaxis, haemoptysis and haematuria over 3 months', '48M', 'Saddle nose deformity, purpuric rash on legs', 'Creatinine 240, urine dip: blood and protein, c-ANCA and PR3 positive', 'Renal biopsy: pauci-immune crescentic glomerulonephritis'] },
    { d: 'Reactive arthritis', diff: 'm', c: ['Painful swollen right knee and ankle 2 weeks after gastroenteritis, with red eye', '28M, gastroenteritis due to Salmonella', 'Swollen right knee with effusion, conjunctivitis, keratoderma blennorrhagicum on soles', 'HLA-B27 positive, cultures negative', 'Diagnosis on clinical grounds'] },
    { d: 'Psoriatic arthritis', diff: 'm', c: ['Painful swollen fingers with skin plaques on elbows for 6 months', '42M', 'Dactylitis of left third finger, nail pitting, psoriatic plaques on extensor surfaces', 'RF negative, CRP 35', 'Hand X-ray: pencil-in-cup deformity at distal interphalangeal joints'] },
    { d: 'Sjogren syndrome', diff: 'm', c: ['Persistent dry eyes and dry mouth for 12 months, joint aches', '55F', 'Dry tongue and mucous membranes, bilateral parotid enlargement', 'ANA positive, anti-Ro and anti-La positive, Schirmer test abnormal', 'Salivary gland biopsy: focal lymphocytic infiltrate'] },
    { d: 'Dermatomyositis', diff: 'h', c: ['Progressive proximal muscle weakness and skin rash for 3 months', '58F', 'Difficulty rising from chair and combing hair, heliotrope rash on eyelids, Gottron papules on knuckles', 'CK 4800, ALT 220, anti-Jo-1 antibody positive', 'Muscle biopsy: perifascicular atrophy with perivascular inflammation'] },
    { d: 'Behcet disease', diff: 'h', c: ['Recurrent painful oral and genital ulcers, red painful eyes and pustular rash', '30M of Turkish origin', 'Aphthous oral ulcers, scrotal ulcers, anterior uveitis, pathergy test positive', 'ESR raised', 'Clinical diagnosis by international criteria'] },
    { d: 'Adult onset Still disease', diff: 'h', c: ['Daily quotidian fever, sore throat and evanescent salmon-pink rash for 4 weeks, with arthralgia', '28F', 'Rash appears with fever spike then fades, cervical lymphadenopathy, splenomegaly', 'Ferritin 12000, WCC 22 neutrophilic, ALT raised, ANA and RF negative', 'Diagnosis by Yamaguchi criteria'] },
  ],
  'Dermatology': [
    { d: 'Psoriasis (chronic plaque)', diff: 'e', c: ['Chronic scaly plaques on elbows and knees for years, worse in winter', '38M, family history in father', 'Well-demarcated erythematous plaques with silvery scale on extensor surfaces, nail pitting, scalp involvement', 'Bloods unremarkable', 'Clinical diagnosis; Auspitz sign positive'] },
    { d: 'Atopic eczema', diff: 'e', c: ['Chronic itchy dry skin from infancy with flare-ups in flexural areas', '8-year-old with hay fever and asthma', 'Flexural erythema and lichenification in antecubital and popliteal fossae, excoriations', 'IgE raised, RAST positive for common allergens', 'Clinical diagnosis'] },
    { d: 'Melanoma', diff: 'm', c: ['Changing pigmented lesion on back over 4 months, now itching and bleeding', '52M with fair skin, history of sunburns as child', '9mm irregular pigmented lesion with variegated colour, asymmetry and irregular border on upper back', 'LDH normal', 'Excision biopsy: superficial spreading melanoma, Breslow depth 1.4mm'] },
    { d: 'Basal cell carcinoma', diff: 'e', c: ['Slow-growing pearly nodule on nose that occasionally bleeds', '68M, outdoor worker with sun damage', '6mm pearly nodule with telangiectasia and rolled edge on right nasal tip', 'None required', 'Biopsy: nodular basal cell carcinoma'] },
    { d: 'Squamous cell carcinoma', diff: 'm', c: ['Enlarging crusted lesion on lower lip for 3 months, occasionally bleeding', '72M lifelong pipe smoker with sun damage', '15mm keratotic ulcerated lesion on lower lip vermilion border, indurated', 'None specific', 'Biopsy: well-differentiated squamous cell carcinoma'] },
    { d: 'Bullous pemphigoid', diff: 'm', c: ['Widespread itchy tense blisters for 3 weeks', '78F', 'Tense fluid-filled bullae on erythematous base on trunk and flexures, no mucosal involvement', 'Eosinophilia', 'Skin biopsy: subepidermal blister with eosinophils; direct immunofluorescence: linear IgG and C3 along basement membrane'] },
    { d: 'Pemphigus vulgaris', diff: 'h', c: ['Painful mouth ulcers for 6 weeks then flaccid skin blisters', '52F', 'Erosions in mouth, flaccid bullae on trunk that rupture easily, Nikolsky sign positive', 'Bloods unremarkable', 'Skin biopsy: intraepidermal blister with acantholysis; DIF: intercellular IgG in fishnet pattern'] },
    { d: 'Erythema multiforme', diff: 'm', c: ['Target-shaped lesions on hands, feet and forearms 10 days after cold sore', '22F', 'Symmetrical target lesions with central duskiness on palms, soles and extensor surfaces', 'HSV-1 IgM positive', 'Clinical diagnosis linked to preceding HSV infection'] },
    { d: 'Stevens-Johnson syndrome', diff: 'h', c: ['Fever, malaise then painful widespread rash and mouth ulceration 10 days after starting lamotrigine', '35F', 'Painful erythematous macules with central blistering on trunk affecting 8% BSA, haemorrhagic mucosal erosions', 'ALT raised, mild AKI, SCORTEN 3', 'Skin biopsy: full-thickness epidermal necrosis'] },
    { d: 'Rosacea', diff: 'e', c: ['Recurrent facial flushing and papules on cheeks and nose for 2 years, triggered by alcohol and heat', '45F Celtic complexion', 'Persistent central facial erythema, papulopustules, telangiectasia, no comedones, sparing periocular area', 'Bloods unremarkable', 'Clinical diagnosis'] },
    { d: 'Acne vulgaris', diff: 'e', c: ['Facial spots for 2 years worsening on chin and back', '17M', 'Comedones, papules and pustules on face, upper back and chest; a few nodules', 'None required', 'Clinical diagnosis'] },
    { d: 'Lichen planus', diff: 'm', c: ['Very itchy violaceous rash on wrists and ankles with lacy white pattern in mouth for 6 weeks', '48F', 'Purple polygonal flat-topped papules on flexor wrists with Wickham striae, reticular white streaks on buccal mucosa', 'Hepatitis C serology negative', 'Skin biopsy: band-like lymphocytic infiltrate at dermo-epidermal junction with saw-tooth rete ridges'] },
    { d: 'Necrobiosis lipoidica', diff: 'h', c: ['Shiny yellow-brown patches on shins for 12 months, occasionally ulcerating', '35F with poorly controlled type 1 diabetes', 'Well-demarcated atrophic yellow-brown plaques with telangiectasia on both shins', 'HbA1c 98', 'Skin biopsy: palisading granulomas with degenerated collagen'] },
    { d: 'Guttate psoriasis', diff: 'm', c: ['Sudden onset of small drop-like scaly lesions on trunk 2 weeks after sore throat', '16F', 'Multiple 5-10mm salmon-pink scaly papules scattered on trunk and proximal limbs', 'ASO titre raised', 'Clinical diagnosis linked to preceding streptococcal infection'] },
    { d: 'Impetigo', diff: 'e', c: ['Yellow crusted lesions on face for 4 days, spreading', '6-year-old', 'Golden-crusted erosions around nose and mouth, no systemic upset', 'None required', 'Swab: Staphylococcus aureus'] },
  ],
  // Paste this INSIDE the CASES object, just before the closing };
// i.e. after your last specialty (probably 'Dermatology': [ ... ],)

  'A&E — Adults': [
    { d: 'Anterior STEMI', diff: 'e', c: ['Crushing central chest pain for 40 minutes, radiating to left arm, sweaty and nauseated', '58M smoker, hypertensive, father died of MI aged 55, GTN gave no relief', 'BP 148/92, HR 96, cold and clammy, chest clear, heart sounds normal', 'Troponin markedly raised, potassium 4.1', 'ECG: 3 mm ST elevation V1–V4 with reciprocal ST depression in inferior leads'] },
    { d: 'Pulmonary embolism', diff: 'm', c: ['Sudden pleuritic chest pain and breathlessness while at her desk', '34F returned yesterday from a 10-hour flight, on combined oral contraceptive, right leg feels heavier', 'RR 26, SpO2 92% on air, HR 118, BP 108/70, right calf 3 cm larger than left', 'D-dimer 4800, ABG: pO2 8.2, pCO2 3.9', 'CTPA: filling defects in right main and segmental pulmonary arteries with right heart strain'] },
    { d: 'Aortic dissection', diff: 'h', c: ['Sudden tearing chest pain radiating to the back between the shoulder blades', '62M long-standing poorly controlled hypertension, pain hit maximum intensity within seconds', 'BP 190/100 right arm, 150/80 left arm, early diastolic murmur, weak left radial pulse', 'Troponin negative, D-dimer 3200, creatinine mildly raised', 'CT aorta: intimal flap extending from aortic root to descending aorta with false lumen'] },
    { d: 'Tension pneumothorax', diff: 'm', c: ['Sudden severe right-sided chest pain and breathlessness while playing football', '24M tall thin, previous small pneumothorax 2 years ago, no trauma today', 'RR 32, SpO2 88%, HR 130, BP 88/54, trachea deviated left, absent breath sounds and hyperresonance on the right', 'Not delayed for bloods', 'Needle decompression before imaging; subsequent CXR confirmed large right pneumothorax with mediastinal shift'] },
    { d: 'Acute appendicitis', diff: 'e', c: ['18 hours of abdominal pain that started around the umbilicus and moved to the right iliac fossa', '22M with anorexia, one episode of vomiting, low-grade fever, no urinary symptoms', 'Temp 37.9, tender at McBurney\'s point with guarding, positive Rovsing\'s sign', 'WCC 15.2, neutrophils 12.1, CRP 88', 'US: non-compressible blind-ending tubular structure in RIF, 9 mm diameter with periappendiceal fluid'] },
    { d: 'Ruptured abdominal aortic aneurysm', diff: 'h', c: ['Sudden severe abdominal and back pain, then collapsed at home', '74M known 5.8 cm AAA on surveillance, smoker, hypertensive', 'BP 82/48, HR 128, pale and clammy, pulsatile expansile mass in the epigastrium', 'Hb 84, lactate 5.2, major haemorrhage protocol activated', 'Bedside US: 6.5 cm infrarenal aortic aneurysm with retroperitoneal free fluid, straight to theatre'] },
    { d: 'Ruptured ectopic pregnancy', diff: 'm', c: ['Sudden left iliac fossa pain and shoulder-tip pain, feeling faint', '28F LMP 7 weeks ago, previous chlamydia, not using contraception', 'BP 94/58, HR 116, generalised abdominal guarding, cervical excitation on PV exam', 'Urine β-hCG positive, Hb 96, serum β-hCG 3200', 'Transvaginal US: empty uterus, complex left adnexal mass, free fluid in the pouch of Douglas'] },
    { d: 'Diabetic ketoacidosis', diff: 'm', c: ['2 days of vomiting, abdominal pain, polyuria and polydipsia', '19F type 1 diabetic, ran out of insulin cartridges last weekend, recent sore throat', 'RR 28 with Kussmaul breathing, dry mucous membranes, HR 118, ketotic breath', 'Glucose 28, pH 7.11, HCO3 8, ketones 5.8, K 5.4', 'ECG: peaked T waves'] },
    { d: 'Subarachnoid haemorrhage', diff: 'h', c: ['Sudden severe occipital headache while lifting a suitcase — "worst of my life", peak within seconds', '46F brief loss of consciousness then vomited twice, photophobia, no prior headaches', 'GCS 14, neck stiffness, no focal neurology, subhyaloid haemorrhage on fundoscopy', 'Bloods unremarkable, LP planned if imaging negative', 'Non-contrast CT head: hyperdensity in the basal cisterns and Sylvian fissures'] },
    { d: 'Ischaemic stroke', diff: 'm', c: ['Sudden right-sided weakness and slurred speech noticed 90 minutes ago', '68M with AF, non-compliant with apixaban, hypertensive, ex-smoker', 'BP 176/94, irregularly irregular pulse, right facial droop, right arm 2/5, expressive dysphasia, NIHSS 12', 'Glucose 6.4, platelets normal', 'CT: no haemorrhage, loss of grey-white differentiation in left MCA territory; CTA shows left M1 occlusion'] },
    { d: 'Anaphylaxis', diff: 'e', c: ['Sudden facial swelling, wheeze and light-headedness 15 minutes after eating a takeaway', '31F known peanut allergy, EpiPen left at home', 'RR 30 with audible wheeze and stridor, SpO2 91%, HR 132, BP 82/48, urticarial rash, tongue swelling', 'Tryptase sent', 'CXR after stabilisation: clear'] },
    { d: 'Paracetamol overdose', diff: 'm', c: ['Took an unknown number of tablets 6 hours ago after an argument', '23F, empty box of 32 x 500 mg paracetamol, drank half a bottle of wine, history of depression', 'Alert, mildly nauseated, no abdominal tenderness, no jaundice, GCS 15', 'Paracetamol level 180 mg/L at 6 hours (above treatment line), ALT 42, INR 1.1', 'N-acetylcysteine started immediately per nomogram, no imaging required'] },
    { d: 'Acute pancreatitis', diff: 'm', c: ['Severe epigastric pain radiating to the back for 12 hours, with vomiting', '52F previous biliary colic, high BMI, non-drinker, pain worse lying flat, better sitting forward', 'Temp 37.8, HR 108, tender epigastrium with guarding, reduced bowel sounds', 'Amylase 1850, WCC 16, CRP 210, calcium 2.05, glucose 11.2, LDH raised', 'US abdomen: gallstones and a dilated CBD; CT (48h) shows peripancreatic oedema without necrosis'] },
    { d: 'Meningococcal septicaemia', diff: 'h', c: ['6 hours of fever, myalgia, cold hands and feet, now drowsy', '19M university student, housemate had similar illness last week, not vaccinated against MenB', 'Temp 39.4, RR 28, HR 132, BP 84/50, GCS 13, non-blanching purpuric rash on trunk and limbs', 'Lactate 5.8, WCC 22, CRP 340, platelets 68, INR 1.6', 'CT head normal, LP deferred due to coagulopathy, blood cultures grew Neisseria meningitidis'] },
    { d: 'Upper GI bleed', diff: 'm', c: ['Three episodes of coffee-ground vomiting and one melaena stool this morning', '64M long-term ibuprofen for knee OA, drinks 30 units/week, previous H. pylori untreated', 'BP 96/60 lying, 78/50 sitting, HR 118, cool peripheries, PR: melaena', 'Hb 78 (previously 138), urea 18, creatinine 92, Glasgow-Blatchford 12', 'OGD: 1.5 cm ulcer in the posterior duodenal bulb with a visible vessel — clipped and adrenaline injected'] }
  ],

  'A&E — Paediatrics': [
    { d: 'Bronchiolitis', diff: 'e', c: ['5-month-old, 3 days of coryza, now with cough, wheeze and poor feeding (under half normal volumes)', 'Winter month, older sibling has a cold, born at term, no comorbidities', 'RR 62, SpO2 91% on air, subcostal recession, tracheal tug, widespread fine crackles and expiratory wheeze', 'CBG: pH 7.34, pCO2 6.1, NPA positive for RSV', 'CXR: hyperinflation and patchy perihilar shadowing, no focal consolidation'] },
    { d: 'Croup', diff: 'e', c: ['2-year-old boy, woken in the night with a barking cough and noisy breathing', 'Coryza for 2 days, fully vaccinated, no drooling, still drinking', 'Temp 38.1, RR 36, SpO2 96%, audible stridor at rest, mild intercostal recession, no tripod position', 'Bloods not indicated', 'No imaging required, improved after single dose of oral dexamethasone'] },
    { d: 'Intussusception', diff: 'm', c: ['9-month-old, episodes of sudden inconsolable crying with drawing up of legs every 15–20 minutes for a day', 'Between episodes appears pale and lethargic, recent viral URTI, one episode of "redcurrant jelly" stool', 'Sausage-shaped mass palpable in the right upper quadrant, empty right iliac fossa, HR 148, cap refill 3 sec', 'WCC 13, CRP 24, lactate 2.4', 'US abdomen: "target sign" in the RUQ, reduced by air enema in radiology'] },
    { d: 'Meningococcal septicaemia', diff: 'h', c: ['3-year-old unwell for 8 hours with fever, lethargy and now a rash', 'Previously well, fully immunised except MenB (parental choice)', 'Temp 39.6, HR 178, cap refill 5 sec, cool peripheries, GCS 13, non-blanching purpuric spots on trunk and lower limbs', 'Lactate 4.9, WCC 24, CRP 260, platelets 74, INR 1.5, glucose 3.1', 'CT normal, LP deferred, blood culture: Gram-negative diplococci — Neisseria meningitidis'] },
    { d: 'Diabetic ketoacidosis', diff: 'm', c: ['11-year-old girl, 3 weeks of polyuria, polydipsia and weight loss; today vomiting and abdominal pain', 'No previous medical history, maternal aunt has type 1 diabetes', 'RR 32 with Kussmaul breathing, dry mucous membranes, HR 128, ketotic breath, mild abdominal tenderness', 'Glucose 32, pH 7.08, HCO3 7, ketones 6.2, Na 132, K 5.1', 'CXR clear, ECG normal'] },
    { d: 'Febrile convulsion', diff: 'e', c: ['18-month-old, generalised tonic-clonic seizure lasting 2 minutes at home, now sleepy', 'Fever and coryza for 24 hours, fully immunised, no family history of epilepsy, first episode', 'Temp 39.2, red bulging tympanic membrane on the right, no rash, no neck stiffness, GCS returning to 15', 'CBG normal, no routine bloods indicated', 'No imaging, discharged with safety-netting after observation'] },
    { d: 'Pyloric stenosis', diff: 'm', c: ['5-week-old boy, non-bilious projectile vomiting after every feed for a week, hungry immediately afterwards', 'First-born, formula-fed, weight has dropped below birth centile', 'Sunken fontanelle, dry mucous membranes, visible peristalsis across epigastrium, olive-sized mass palpable in RUQ during test feed', 'Capillary gas: pH 7.52, HCO3 34, Cl 88, K 3.1 — hypochloraemic hypokalaemic metabolic alkalosis', 'US abdomen: pyloric muscle thickness 5 mm, channel length 18 mm'] },
    { d: 'Testicular torsion', diff: 'm', c: ['14-year-old boy, sudden severe left scrotal pain 3 hours ago while playing rugby, one episode of vomiting', 'Previous similar transient episodes that self-resolved, no urinary symptoms, no trauma', 'Left testis high-riding with horizontal lie, exquisitely tender, absent cremasteric reflex, negative Prehn\'s sign', 'Urine dip negative for leucocytes and nitrites', 'No imaging — taken straight to theatre for scrotal exploration'] },
    { d: 'Non-accidental injury', diff: 'h', c: ['4-month-old brought in "not moving her arm" after "rolling off the sofa" 2 days ago', 'Multiple attendances at different EDs, story changes between parents, not yet developmentally rolling', 'Bruising in different stages on trunk and thighs, frenular tear, tender swollen left upper arm, retinal haemorrhages', 'FBC and clotting normal — excludes bleeding disorder', 'Skeletal survey: spiral fracture of the left humerus, healing posterior rib fractures; CT head: subdural haemorrhage'] },
    { d: 'Inhaled foreign body', diff: 'm', c: ['2-year-old, sudden coughing and choking while eating peanuts an hour ago, now persistent cough and wheeze', 'No fever, previously well, no history of asthma, recovered from initial choking episode', 'RR 36, SpO2 94%, unilateral reduced air entry on the right with monophonic wheeze, no stridor', 'FBC and CRP normal', 'CXR (insp/exp): hyperinflation of the right lung on expiration; rigid bronchoscopy retrieved a peanut fragment'] },
    { d: 'Acute asthma exacerbation', diff: 'e', c: ['8-year-old boy, worsening wheeze and shortness of breath overnight, unable to speak in full sentences', 'Known asthmatic on inhaled steroid, poor adherence, recent cold, cat at home', 'RR 38, SpO2 90% on air, HR 138, widespread polyphonic wheeze, subcostal recession, PEFR 45% predicted', 'CBG: pH 7.36, pCO2 4.2 (normal — worry if rising)', 'CXR: hyperinflation, no focal consolidation, no pneumothorax'] },
    { d: 'Gastroenteritis with dehydration', diff: 'e', c: ['3-year-old, 2 days of watery diarrhoea (8 episodes/day) and vomiting, nursery outbreak', 'Reduced wet nappies (last one 8 hours ago), drinking small sips but vomiting them back', 'HR 148, cap refill 3 sec, dry mucous membranes, sunken eyes, reduced skin turgor, alert, weight 4% below baseline', 'U&E: Na 141, K 3.6, urea 7.8, creatinine 42, glucose 4.1', 'No imaging; improved with a trial of oral rehydration solution via NG tube'] },
    { d: 'Kawasaki disease', diff: 'h', c: ['4-year-old, high fever for 6 days unresponsive to paracetamol, increasingly irritable', 'No sick contacts, fully immunised, no foreign travel, antibiotics from GP made no difference', 'Bilateral non-purulent conjunctivitis, cracked red lips and strawberry tongue, truncal rash, unilateral cervical lymphadenopathy, red swollen hands with early peeling', 'WCC 18, CRP 180, platelets 620, ALT 84, albumin 28, sterile pyuria on urine dip', 'Echocardiogram: mild dilatation of the left main coronary artery — no aneurysms yet'] },
    { d: 'Henoch-Schönlein purpura', diff: 'm', c: ['6-year-old boy, palpable purpuric rash over buttocks and lower legs for 3 days, now with colicky abdominal pain and swollen painful right ankle', 'Recent URTI two weeks ago, no sick contacts, no bleeding tendency', 'Symmetrical palpable purpura on extensor surfaces of lower limbs and buttocks, tender right ankle, mild periumbilical tenderness', 'Platelets 340 (normal), clotting normal, urine dip: 2+ blood 1+ protein, creatinine normal', 'US abdomen: no intussusception; renal function to be monitored serially'] },
    { d: 'Neonatal sepsis', diff: 'h', c: ['2-day-old term neonate, poor feeding, grunting and lethargy since this morning', 'Mother had prolonged rupture of membranes (28 hours), no intrapartum antibiotics, GBS status unknown', 'Temp 35.6, RR 68, grunting with nasal flaring, SpO2 90% in air, cap refill 4 sec, mottled, floppy tone, weak cry', 'CBG: pH 7.18, lactate 6.4, glucose 2.1; WCC 3.2 with neutropenia, CRP 92, platelets 82', 'CXR: bilateral streaky infiltrates; blood culture grew group B streptococcus'] }
  ],
};

// ============ HELPERS ============
const DIFF_LABEL = { e: 'Easy', m: 'Medium', h: 'Hard' };
const DIFF_COLOR = { e: 'bg-emerald-100 text-emerald-700 border-emerald-200', m: 'bg-amber-100 text-amber-700 border-amber-200', h: 'bg-rose-100 text-rose-700 border-rose-200' };
const CLUE_LABELS = ['Presenting complaint', 'History', 'Examination', 'Investigations', 'Special test / Imaging'];

const CAREER_STAGES = [
  { id: 'student', label: 'Medical student' },
  { id: 'foundation', label: 'Foundation / Intern (FY / PGY1)' },
  { id: 'core', label: 'Core trainee / SHO' },
  { id: 'registrar', label: 'Resident / Registrar' },
  { id: 'consultant', label: 'Consultant / Attending / SAS' },
  { id: 'pa', label: 'Physician Associate / ANP' },
  { id: 'browsing', label: 'Just browsing' },
];
const TRAINING_SYSTEMS = [
  { id: 'uk', label: 'UK (MBBS)' },
  { id: 'us_md', label: 'US (MD)' },
  { id: 'us_do', label: 'US (DO)' },
  { id: 'ireland', label: 'Ireland' },
  { id: 'anz', label: 'Australia / NZ' },
  { id: 'canada', label: 'Canada' },
  { id: 'eu', label: 'EU' },
  { id: 'other', label: 'Other' },
];
const PROFILE_KEY = 'medscore_profile_v1';


const normalize = (s) => s.toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Fuzzy match: check if guess matches diagnosis with tolerance
function matchDiagnosis(guess, target) {
  const g = normalize(guess);
  const t = normalize(target);
  if (!g) return false;
  if (g === t) return true;
  // Check core noun overlap: guess contains main word of target
  const tWords = t.split(' ').filter(w => w.length > 3);
  const gWords = g.split(' ').filter(w => w.length > 3);
  if (tWords.length === 0 || gWords.length === 0) return g === t;
  // Require >=70% of significant target words to appear in guess
  const matches = tWords.filter(tw => gWords.some(gw => gw.includes(tw) || tw.includes(gw) || levenshtein(tw, gw) <= 1));
  return matches.length / tWords.length >= 0.7;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  }
  return dp[m][n];
}


// ============ PROFILE SETUP COMPONENT ============
function ProfileSetup({ initial, isEdit, onSave, onCancel, onClear }) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [stage, setStage] = useState(initial?.stage || '');
  const [system, setSystem] = useState(initial?.system || '');
  const [specialties, setSpecialties] = useState(initial?.specialties || []);

  const toggleSpecialty = (sp) => {
    setSpecialties(prev => prev.includes(sp) ? prev.filter(s => s !== sp) : [...prev, sp]);
  };

  const canSave = name.trim().length > 0 && stage && system;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      email: email.trim(),
      stage,
      system,
      specialties,
      createdAt: initial?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-6 pb-12">
        <div className="text-center mb-8">
          <img src={LOGO} alt="MedScore" className="w-24 h-24 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {isEdit ? 'Your profile' : 'Welcome to MedScore Academy'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEdit ? 'Update your details anytime.' : "Tell us a bit about you so we can tailor cases to your level."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-slate-400 mt-1">Stored only on this device. Nothing sent anywhere.</p>
          </div>

          {/* Career stage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Career stage <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAREER_STAGES.map(cs => (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => setStage(cs.id)}
                  className="text-left px-3 py-2 rounded-lg border-2 text-sm transition"
                  style={stage === cs.id
                    ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0', fontWeight: 500 }
                    : { borderColor: '#E2E8F0', color: '#475569' }}
                >
                  {cs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Training system */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Training system <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRAINING_SYSTEMS.map(ts => (
                <button
                  key={ts.id}
                  type="button"
                  onClick={() => setSystem(ts.id)}
                  className="text-left px-3 py-2 rounded-lg border-2 text-sm transition"
                  style={system === ts.id
                    ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0', fontWeight: 500 }
                    : { borderColor: '#E2E8F0', color: '#475569' }}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specialties of interest */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialties you want to focus on</label>
            <p className="text-xs text-slate-400 mb-2">Pick any that interest you. You'll always be able to see the rest too.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(CASES).map(sp => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleSpecialty(sp)}
                  className="text-left px-3 py-2 rounded-lg border-2 text-sm transition"
                  style={specialties.includes(sp)
                    ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0', fontWeight: 500 }
                    : { borderColor: '#E2E8F0', color: '#475569' }}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {isEdit && (
            <button onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition">
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
            style={{ background: 'linear-gradient(135deg, #4FC3E0 0%, #1E88E5 100%)' }}
          >
            {isEdit ? 'Save changes' : 'Get started'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isEdit && (
          <div className="mt-6 text-center">
            <button onClick={() => { if (confirm('Delete your profile? This clears your data on this device.')) onClear(); }} className="text-xs text-rose-500 hover:text-rose-600 underline">
              Delete profile and start over
            </button>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          Your profile lives only on this device. No accounts, no tracking.
        </p>
      </div>
    </div>
  );
}

// ============ APP ============
export default function App() {
  const [profile, setProfile] = useState(null); // {name, email, stage, system, specialties: []}
  const [screen, setScreen] = useState('loading'); // loading | setup | home | play | end | editProfile
  const [specialty, setSpecialty] = useState(null);
  const [difficulty, setDifficulty] = useState('all');
  const [caseIdx, setCaseIdx] = useState(0);
  const [filteredCases, setFilteredCases] = useState([]);
  const [revealed, setRevealed] = useState(1);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [voiceError, setVoiceError] = useState('');
  const [score, setScore] = useState({ correct: 0, played: 0 });

  const recognitionRef = useRef(null);
  const currentCase = filteredCases[caseIdx];

  // Load profile on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setProfile(p);
        setScreen('home');
      } else {
        setScreen('setup');
      }
    } catch (e) {
      setScreen('setup');
    }
  }, []);

  const saveProfile = (p) => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      setProfile(p);
    } catch (e) { console.error(e); }
  };

  const clearProfile = () => {
    try { localStorage.removeItem(PROFILE_KEY); } catch (e) {}
    setProfile(null);
    setScreen('setup');
  };

  // Init speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-GB';
    rec.interimResults = true;      // live transcription while speaking
    rec.maxAlternatives = 3;
    rec.continuous = true;          // keep listening until user presses Done

    let finalTranscript = '';

    rec.onstart = () => { finalTranscript = ''; };

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      // fills the input box live as you speak
      setInput((finalTranscript + interim).trim());
    };

    rec.onerror = (e) => { setVoiceError(e.error || 'voice error'); setListening(false); };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);
  
  const startGame = () => {
    let pool = CASES[specialty];
    if (difficulty !== 'all') pool = pool.filter(c => c.diff === difficulty);
    if (pool.length === 0) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setFilteredCases(shuffled);
    setCaseIdx(0);
    resetCase();
    setScore({ correct: 0, played: 0 });
    setScreen('play');
  };

  const resetCase = () => {
    setRevealed(1);
    setGuesses([]);
    setInput('');
    setSuggestions([]);
    stopSpeaking();
  };

  const nextCase = () => {
    if (caseIdx + 1 >= filteredCases.length) {
      setScreen('home');
      return;
    }
    setCaseIdx(caseIdx + 1);
    resetCase();
    setScreen('play');
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const playCase = () => {
    if (!window.speechSynthesis || !currentCase) return;
    if (speaking) { stopSpeaking(); return; }
    const text = currentCase.c.slice(0, revealed)
      .map((clue, i) => `${CLUE_LABELS[i]}. ${clue}.`)
      .join(' ');
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setVoiceError('');
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const submitGuess = () => {
    if (!input.trim() || !currentCase) return;
    const isRight = matchDiagnosis(input, currentCase.d);
    const newGuess = { text: input.trim(), correct: isRight };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setInput('');
    setSuggestions([]);
    stopSpeaking();
    if (isRight) {
      setScore(s => ({ correct: s.correct + 1, played: s.played + 1 }));
      setScreen('end');
      return;
    }
    if (newGuesses.length >= 5) {
      setScore(s => ({ ...s, played: s.played + 1 }));
      setScreen('end');
      return;
    }
    setRevealed(r => Math.min(r + 1, 5));
  };

  // autocomplete
  useEffect(() => {
    if (!input.trim() || !specialty) { setSuggestions([]); return; }
    const q = normalize(input);
    const pool = CASES[specialty].map(c => c.d);
    const matches = pool.filter(d => normalize(d).includes(q)).slice(0, 5);
    setSuggestions(matches);
  }, [input, specialty]);

  // ============ RENDER ============

  // ===== LOADING SCREEN =====
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <img src={LOGO} alt="MedScore" className="w-24 h-24 object-contain opacity-70 animate-pulse" />
      </div>
    );
  }

  // ===== SETUP / EDIT PROFILE SCREEN =====
  if (screen === 'setup' || screen === 'editProfile') {
    return <ProfileSetup
      initial={profile}
      isEdit={screen === 'editProfile'}
      onSave={(p) => { saveProfile(p); setScreen('home'); }}
      onCancel={() => setScreen('home')}
      onClear={clearProfile}
    />;
  }

  if (screen === 'home') {
    const userSpecialties = profile?.specialties || [];
    const otherSpecialties = Object.keys(CASES).filter(sp => !userSpecialties.includes(sp));
    const firstName = (profile?.name || '').split(' ')[0];
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          {/* Top bar with profile chip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src={LOGO} alt="MedScore" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  <span style={{ color: '#4FC3E0' }}>MED</span><span style={{ color: '#1565C0' }}>SCORE</span> Academy
                </div>
                {firstName && <div className="text-xs text-slate-500">Hi, {firstName}</div>}
              </div>
            </div>
            <button onClick={() => setScreen('editProfile')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" title="Profile settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-slate-600 text-sm">Guess the diagnosis. One clue at a time. Voice enabled.</p>
          </div>

          {/* For You section */}
          {userSpecialties.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: '#1E88E5' }} />
                <h2 className="font-semibold text-slate-700">For you</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {userSpecialties.map(sp => (
                  <button
                    key={sp}
                    onClick={() => setSpecialty(sp)}
                    className="p-4 rounded-xl border-2 text-sm font-medium transition"
                    style={specialty === sp
                      ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0' }
                      : { borderColor: '#BBDEFB', backgroundColor: '#F5FBFF', color: '#1565C0' }}
                  >
                    {sp}
                    <div className="text-xs text-slate-400 mt-1">{CASES[sp].length} cases</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All / Explore More section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
            <h2 className="font-semibold text-slate-700 mb-3">
              {userSpecialties.length > 0 ? 'Explore more' : 'Choose a specialty'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {otherSpecialties.map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpecialty(sp)}
                  className="p-4 rounded-xl border-2 text-sm font-medium transition"
                  style={specialty === sp
                    ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0' }
                    : { borderColor: '#E2E8F0', color: '#334155' }}
                >
                  {sp}
                  <div className="text-xs text-slate-400 mt-1">{CASES[sp].length} cases</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
            <h2 className="font-semibold text-slate-700 mb-3">Difficulty</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { k: 'all', label: 'All' },
                { k: 'e', label: 'Easy' },
                { k: 'm', label: 'Medium' },
                { k: 'h', label: 'Hard' },
              ].map(d => (
                <button
                  key={d.k}
                  onClick={() => setDifficulty(d.k)}
                  className="p-3 rounded-xl border-2 text-sm font-medium transition"
                  style={difficulty === d.k
                    ? { borderColor: '#1E88E5', backgroundColor: '#E3F2FD', color: '#1565C0' }
                    : { borderColor: '#E2E8F0', color: '#334155' }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={!specialty}
            className="w-full py-4 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
            style={{ background: 'linear-gradient(135deg, #4FC3E0 0%, #1E88E5 100%)' }}
          >
            Start playing <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-slate-400 text-center mt-6">Voice input works best in Chrome, Edge, or Safari. Educational use only — not for clinical decision-making.</p>
        </div>
      </div>
    );
  }

  if (screen === 'end') {
    const wasCorrect = guesses[guesses.length - 1]?.correct;
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-10">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 text-center">
            {wasCorrect ? (
              <>
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Correct!</h2>
                <p className="text-slate-600 mb-1">Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}</p>
              </>
            ) : (
              <>
                <X className="w-16 h-16 text-rose-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Out of guesses</h2>
              </>
            )}
            <div className="my-4 py-3 px-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Diagnosis</div>
              <div className="text-lg font-semibold text-slate-800">{currentCase.d}</div>
            </div>

            <div className="text-sm text-slate-600 mb-6">
              Score this session: {score.correct} / {score.played}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setScreen('home')} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={nextCase} className="flex-1 py-3 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #4FC3E0 0%, #1E88E5 100%)' }}>
                Next case <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAY SCREEN =====
  const remaining = 5 - guesses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pt-2">
          <button onClick={() => setScreen('home')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm">
            <Home className="w-4 h-4" /> Home
          </button>
          <div className="text-sm text-slate-600">
            Case {caseIdx + 1} of {filteredCases.length}
          </div>
        </div>

        {/* Case card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{specialty}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFF_COLOR[currentCase.diff]}`}>
                {DIFF_LABEL[currentCase.diff]}
              </span>
            </div>
            <button
              onClick={playCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
            >
              {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {speaking ? 'Stop' : 'Play case'}
            </button>
          </div>

          <div className="p-4 space-y-3">
            {currentCase.c.slice(0, revealed).map((clue, i) => (
              <div key={i} className="animate-fadeIn">
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#1E88E5' }}>
                  {CLUE_LABELS[i]}
                </div>
                <div className="text-slate-700 leading-relaxed">{clue}</div>
              </div>
            ))}
            {revealed < 5 && (
              <div className="pt-2 text-xs text-slate-400 italic">
                {5 - revealed} more clue{5 - revealed === 1 ? '' : 's'} will unlock after each incorrect guess
              </div>
            )}
          </div>
        </div>

        {/* Guesses */}
        {guesses.length > 0 && (
          <div className="mb-4 space-y-2">
            {guesses.map((g, i) => (
              <div key={i} className={`flex items-center gap-2 p-3 rounded-lg border ${g.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                {g.correct ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span className="text-sm text-slate-700">{g.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium text-slate-700">Your diagnosis</div>
            <div className="text-xs text-slate-400 ml-auto">{remaining} guess{remaining === 1 ? '' : 'es'} left</div>
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitGuess(); }}
                placeholder="Type or tap the mic to speak"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={listening ? stopListening : startListening}
                className={`px-4 rounded-xl transition ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                title={listening ? 'Stop listening' : 'Speak your guess'}
              >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={submitGuess}
                disabled={!input.trim()}
                className="px-5 rounded-xl text-white font-medium disabled:opacity-40 transition shadow-sm"
                style={{ background: 'linear-gradient(135deg, #4FC3E0 0%, #1E88E5 100%)' }}
              >
                Guess
              </button>
            </div>

            {/* Autocomplete */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); setSuggestions([]); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {listening && (
            <div className="mt-3 text-xs text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Listening… speak your diagnosis
            </div>
          )}
          {voiceError && (
            <div className="mt-2 text-xs text-amber-700">{voiceError}</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out; }
      `}</style>
    </div>
  );
}
