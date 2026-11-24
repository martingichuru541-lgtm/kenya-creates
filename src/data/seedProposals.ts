import { InnovationProposal, InnovationAuditLog } from '../types';

export const SEED_PROPOSALS: InnovationProposal[] = [
  {
    id: 'KE-PROP-2026-081',
    type: 'new_business',
    title: "HassDirect Murang'a — B2B Avocado Exporter & Cold-Chain Hub",
    category: 'Agriculture & Food',
    county: "Murang'a",
    contributorId: 'user_1',
    contributorName: 'Wambui Kamau',
    contributorEmail: 'wambui.kamau@murangafarmers.co.ke',
    contributorPhone: '+254 712 345 678',
    originalIdea:
      'I am a farmer from Kangari, Murang’a. KenyaOne has many digital tools, but we desperately need a direct platform where smallholder avocado and macadamia farmers can sell directly to supermarkets in Nairobi and international exporters in the Netherlands and UAE without broker middlemen stealing 60% of our harvest value.',
    description:
      'A sovereign cold-chain logistics and direct B2B trading exchange bypassing local broker rings to connect over 24,000 Central Kenya avocado growers directly to verified export off-takers.',
    submissionDate: '2026-10-18',
    updatedAt: '2026-11-04',
    status: 'partnership_evaluation',
    confidential: false,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'offered_50_50',
    partnershipOfferType: 'fifty_fifty',
    aiFeasibilityScore: 94,
    aiNationalImpactScore: 96,
    problemAnalysis: {
      problem:
        'Smallholder avocado growers in Murang’a, Nyeri, and Meru lose 40-60% of farm-gate value to unscrupulous cartels and brokers who control transport and export packhouse booking slots.',
      limitations:
        'Individual farmers lack export phytosanitary documentation (KEPHIS), certified cold transport, and collective bargaining power with global buyers.',
      beneficiaries:
        'Over 85,000 horticultural farming households across Murang’a, Kiambu, Meru, and Kisii, plus retail supermarkets and European importers.',
      affectedCounties: ["Murang'a", 'Kiambu', 'Nyeri', 'Meru', 'Embu', 'Kisii'],
      existingAlternatives:
        'Informal village brokers ("middlemen") paying cash-on-scale at depressed rates with uncalibrated scales.',
      whyItMatters:
        'Avocados are Kenya’s fastest-growing horticultural export; keeping wealth with growers elevates rural household incomes and forex reserves.',
    },
    proposedSolution: {
      recommendedSolution:
        'Establish an authenticated digital off-take exchange coupled with solar refrigerated aggregation hubs at sub-county collection centers.',
      howItWorks:
        'Growers log harvest readiness via USSD or smartphone. Verified exporters bid forward contracts backed by digital escrow. Cold vans consolidate crates for direct airport transfer.',
      websiteFeatures: [
        'Live forward price ticker (EUR/USD/KES per 4kg carton)',
        'Digital escrow contract generator with KEPHIS barcode tracking',
        'Direct bulk-buying portal for hotels & supermarkets',
      ],
      mobileFeatures: [
        '*483*77# USSD interface for feature phone harvest logging',
        'Offline photo quality grader verifying export Grade 1 Hass',
        'Automated M-Pesa B2C instant settlement upon cold depot scan',
      ],
      aiIntegration:
        'Edge computer vision on smartphones grading fruit skin texture, oil content maturity, and defect rejection before dispatch.',
      requiredApis: ['M-Pesa Daraja API', 'KEPHIS Phytosanitary Database API', 'KRA eTIMS Tax Invoice Integration'],
    },
    businessModel: {
      revenueStreams: [
        '2.5% transaction commission on confirmed B2B container sales',
        'Cold-chain transport fee per crate (KES 45/crate)',
        'Premium export quality certification and logistics escrow fee',
      ],
      transactionCommissions: '2.5% per traded metric tonne',
      operatingExpensesEstimate: 'KES 1,200,000 monthly for depot telemetry, field scouts, and server infrastructure.',
      potentialProfitability: 'Projected net profit of KES 4.2M - 6.8M annually at 10,000 tonnes throughput.',
      financialAssumptions: '5% market share of Central Kenya Hass export volumes within 18 months.',
    },
    nationalImpact: {
      beneficiariesEstimate: '85,000 smallholder farming families',
      countiesCovered: '6 primary horticultural counties expanding to 14 nationwide',
      employmentCreation: '340 direct packhouse jobs and 1,200 seasonal harvesting/logistics positions',
      economicContribution: 'Injecting KES 480M directly into rural economies per season',
      internationalExpansion: 'Replication blueprint ready for Tanzania avocado belt and Rwanda horticulture',
    },
    technicalRequirements: {
      infrastructure: 'High-availability PostgreSQL cluster with GPS telematics ingestion for refrigerated trucks',
      database: 'Relational DB tracking batches, cold storage temperatures, and farmer escrow balances',
      apis: ['Safaricom M-Pesa Daraja', 'KEPHIS e-Cert', 'Google Maps Fleet Tracking'],
      securityRequirements: 'End-to-end cryptographic provenance hashes for organic EU traceability compliance',
      estimatedDevelopmentWeeks: 12,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: [
        'Lead farmer cooperative mobilization and sub-county grower onboarding',
        'Coordinate field quality assessment and local packhouse relationships in Kangari and Kandara',
        'Serve as Agricultural Domain Director on the joint project oversight board',
      ],
      kenyaOneResponsibilities: [
        'Engineer the complete digital platform, USSD gateways, and automated escrow smart contracts',
        'Provide sovereign cloud infrastructure, cybersecurity, and eTIMS tax compliance integrations',
        'Facilitate national government liaison (Ministry of Agriculture, KEPHIS, KeNIA)',
      ],
      structureNote:
        'Structured as 50/50 Net Profit Sharing Agreement post-recovery of direct operational deployment expenses.',
    },
    conversationHistory: [
      {
        id: 'msg_1',
        sender: 'user',
        senderName: 'Wambui Kamau',
        message:
          'I am a farmer from Murang’a. I need a platform where smallholder avocado farmers can sell directly to supermarkets and exporters without brokers robbing us.',
        timestamp: '2026-10-18T09:14:00Z',
      },
      {
        id: 'msg_2',
        sender: 'ai',
        senderName: 'KenyaOne AI',
        message:
          'Habari Wambui! This is an urgent, high-impact national challenge. To structure this for the KenyaOne Administrator, who would benefit most, and how should rural farmers without internet log their harvest?',
        timestamp: '2026-10-18T09:15:30Z',
      },
      {
        id: 'msg_3',
        sender: 'user',
        senderName: 'Wambui Kamau',
        message:
          'Over 20,000 farmers in Murang’a alone! Many have feature phones (Kabambe), so we need a USSD code like *483#. When the avocado is picked, they dial, enter their crates, and our collection center verifies.',
        timestamp: '2026-10-18T09:18:22Z',
      },
      {
        id: 'msg_4',
        sender: 'ai',
        senderName: 'KenyaOne AI',
        message:
          'Understood. Would you be willing to actively partner with KenyaOne on a 50/50 co-development model to lead the agricultural cooperative ground operations while KenyaOne builds the tech?',
        timestamp: '2026-10-18T09:20:00Z',
      },
      {
        id: 'msg_5',
        sender: 'user',
        senderName: 'Wambui Kamau',
        message:
          'Ndiyo kabisa! I have 12 years of grower leadership and can bring 4 registered cooperative societies on day one.',
        timestamp: '2026-10-18T09:21:45Z',
      },
    ],
    adminFeedback:
      'Outstanding strategic proposal. Meets all criteria for the KenyaOne 50/50 National Partnership Programme. Feasibility verified by KeNIA and Ministry of Agriculture standards. Agreement prepared for final review.',
    assignedProjectManager: 'Eng. Patrick Nderitu (KenyaOne Infrastructure)',
    agreement: {
      id: 'AGR-KE-2026-004',
      proposalId: 'KE-PROP-2026-081',
      projectTitle: "HassDirect Murang'a — B2B Avocado Exporter & Cold-Chain Hub",
      contributorId: 'user_1',
      contributorName: 'Wambui Kamau',
      kenyaOneSharePercent: 50,
      contributorSharePercent: 50,
      modelType: 'net_profit_sharing',
      effectiveDate: '2026-11-01',
      ipAssignmentClause:
        'Joint sovereign intellectual property license under Kenya Industrial Property Institute (KIPI) guidelines. The proprietary trading algorithms and sovereign data belong to the KenyaOne Sovereign Digital Infrastructure, while domain operations and agricultural trademark rights are jointly co-owned.',
      confidentialityClause:
        'Both parties agree to treat all farmer database records, exporter pricing matrices, and technical source code as strictly confidential under the Kenya Data Protection Act 2019.',
      accountingAuditClause:
        'Monthly certified financial reconciliation published on the 5th of each calendar month. Net distributable profit equals gross trading commissions minus verifiable third-party cloud, telecommunication, and cold-depot expenses.',
      disputeResolution:
        'Nairobi Centre for International Arbitration (NCIA) under Kenyan commercial arbitration law.',
      terminationClause:
        'Either party may terminate on 90 days written notice for material uncured breach. Contributor retains 50% revenue share on all recurring contracts initiated during active participation.',
      signedByContributor: true,
      signedByContributorDate: '2026-11-02T14:30:00Z',
      signedByAdmin: true,
      signedByAdminDate: '2026-11-03T11:15:00Z',
      status: 'executed',
    },
    financialReports: [
      {
        id: 'FIN-2026-OCT',
        proposalId: 'KE-PROP-2026-081',
        projectTitle: "HassDirect Murang'a",
        period: 'October 2026 (Pilot Harvest Phase)',
        grossRevenue: 2450000,
        refunds: 0,
        transactionFees: 36750,
        operatingExpenses: 650000,
        taxesStatutory: 360000,
        netDistributableProfit: 1403250,
        kenyaOneShare: 701625,
        contributorShare: 701625,
        payoutStatus: 'paid',
        payoutReference: 'MPESA-TX-QK91829401',
        payoutDate: '2026-11-05',
      },
    ],
  },
  {
    id: 'KE-PROP-2026-082',
    type: 'new_business',
    title: 'BodaVolt — Smart Solar Battery Swapping & M-Pesa Micro-Leasing',
    category: 'Renewable Energy',
    county: 'Uasin Gishu',
    contributorId: 'user_2',
    contributorName: 'Kevin Odhiambo',
    contributorEmail: 'kevin.odhiambo@bodavolt.co.ke',
    contributorPhone: '+254 722 998 877',
    originalIdea:
      'Over 200,000 bodaboda riders in the Rift Valley spend KES 900 every day on petrol. We can build modular solar battery swap cabinets where a rider scans a QR code, drops their depleted battery, and picks a 100% charged lithium pack in 45 seconds for KES 150.',
    description:
      'National decentralized electric bodaboda powertrain retrofit and automated solar battery swapping network operating across Eldoret, Nakuru, and Kisumu corridors.',
    submissionDate: '2026-09-22',
    updatedAt: '2026-11-01',
    status: 'in_development',
    confidential: false,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'active_partner',
    partnershipOfferType: 'fifty_fifty',
    aiFeasibilityScore: 98,
    aiNationalImpactScore: 99,
    problemAnalysis: {
      problem:
        'Bodaboda riders spend up to 45% of daily gross income on volatile imported fossil fuels while spewing urban carbon emissions.',
      limitations:
        'Existing EV motorbikes require riders to buy costly proprietary chargers and wait 4 hours to recharge at home.',
      beneficiaries:
        '1.8 million Kenyan commercial motorcycle operators, commuters, urban residents, and county clean-air initiatives.',
      affectedCounties: ['Uasin Gishu', 'Nakuru', 'Kisumu', 'Nairobi', 'Kiambu', 'Kakamega'],
      existingAlternatives: 'Traditional petrol filling stations and expensive imported turnkey EV bikes.',
      whyItMatters:
        'Halves rider daily fuel costs from KES 900 to KES 400, adding KES 15,000 monthly take-home income per family while utilizing Kenya’s 92% renewable grid electricity.',
    },
    proposedSolution: {
      recommendedSolution:
        'Standardized universal swappable battery pack with automated smart cabinet locks and M-Pesa automated micro-debit.',
      howItWorks:
        'Rider arrives at solar swap kiosk (at petrol stations and boda stages). Taps NFC card or scans QR code. Door pops open with charged battery. Depleted battery inserted and locked.',
      websiteFeatures: [
        'Fleet operator dashboard monitoring battery health, SoC, and swap telemetry',
        'Cabinet location map with real-time charged battery availability counts',
        'Carbon credit issuance registry measuring real-time CO2 displaced',
      ],
      mobileFeatures: [
        'Rider smartphone app with station distance navigation',
        'M-Pesa balance top-up with Paybill and automated subscription overdraft',
        'Emergency roadside battery dispatch alert system',
      ],
      aiIntegration:
        'Predictive demand forecasting AI distributing batteries across stations before evening rush-hour traffic peaks.',
      requiredApis: ['Safaricom M-Pesa B2B / C2B', 'IoT MQTT Battery Telemetry Gateway', 'Kenya Power Prepaid Meter API'],
    },
    businessModel: {
      revenueStreams: [
        'Swap fee of KES 150 per battery swap (equivalent to 70km range)',
        'Battery leasing subscription fee (KES 250 weekly maintenance)',
        'Certified carbon credit monetization to institutional green funds',
      ],
      transactionCommissions: 'KES 25 margin per battery swap',
      operatingExpensesEstimate: 'Cabinet amortisation, depot rent, solar maintenance: KES 850,000 monthly per 20 cabinets.',
      potentialProfitability: 'KES 3.6M monthly gross operating profit at 1,000 daily active riders.',
      financialAssumptions: 'Average rider swaps 2.2 times per day; battery cell lifecycle 2,000 full cycles.',
    },
    nationalImpact: {
      beneficiariesEstimate: '250,000 commercial riders within 3 years',
      countiesCovered: 'All 47 counties along national transit corridors',
      employmentCreation: '850 trained solar depot technicians and station attendants',
      economicContribution: 'Over KES 2.1 Billion saved annually in avoided petrol imports',
      internationalExpansion: 'Expandable to Uganda, Rwanda, and Tanzania motorcycle markets',
    },
    technicalRequirements: {
      infrastructure: 'High-throughput MQTT broker handling real-time telemetry from 10,000 battery BMS chips',
      database: 'TimescaleDB time-series database tracking voltage, temperature, GPS, and lifecycle degradation',
      apis: ['M-Pesa Daraja', 'Cellular eSIM Roaming API', 'Weather Telemetry'],
      securityRequirements: 'Remote battery kill-switch prevents theft; encrypted battery-to-charger handshake',
      estimatedDevelopmentWeeks: 16,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: [
        'Lead mechanical engineering, battery casing fabrication, and local technician training',
        'Manage rider stage associations and SACCO partnership agreements in Eldoret and Nakuru',
        'Oversee hardware prototype testing and KEBS standard compliance',
      ],
      kenyaOneResponsibilities: [
        'Build the cloud IoT backend, M-Pesa automated billing gateways, and mobile app ecosystem',
        'Facilitate county government concession permits for solar kiosk installations',
        'Structure national carbon credit commercialization with Nairobi Climate Exchange',
      ],
      structureNote:
        'Formal 50/50 Joint Commercialization Agreement with monthly net profit distribution to founder.',
    },
    conversationHistory: [
      {
        id: 'msg_b1',
        sender: 'user',
        senderName: 'Kevin Odhiambo',
        message:
          'Bodaboda riders in Eldoret spend over 900 bob daily on fuel. We built a prototype solar battery swap box that swaps batteries in 45 seconds for 150 bob. Can KenyaOne help us scale nationally?',
        timestamp: '2026-09-22T10:00:00Z',
      },
      {
        id: 'msg_b2',
        sender: 'ai',
        senderName: 'KenyaOne AI',
        message:
          'Habari Kevin! This aligns directly with Kenya’s e-mobility transition. How will the software handle battery theft, and have you tested this with a registered Bodaboda SACCO?',
        timestamp: '2026-09-22T10:02:15Z',
      },
      {
        id: 'msg_b3',
        sender: 'user',
        senderName: 'Kevin Odhiambo',
        message:
          'Yes, we tested with 25 riders from Wareng Boda SACCO. The battery has an integrated GPS and GSM chip that disables power if it leaves the authorized 20km geofence without a valid swap.',
        timestamp: '2026-09-22T10:05:40Z',
      },
    ],
    adminFeedback:
      'Approved for fast-track development under KenyaOne Sovereign CleanTech Division. 50/50 partnership signed and in active execution.',
    assignedProjectManager: 'Dr. Sharon Koech (KenyaOne Energy & IoT)',
    agreement: {
      id: 'AGR-KE-2026-002',
      proposalId: 'KE-PROP-2026-082',
      projectTitle: 'BodaVolt — Smart Solar Battery Swapping',
      contributorId: 'user_2',
      contributorName: 'Kevin Odhiambo',
      kenyaOneSharePercent: 50,
      contributorSharePercent: 50,
      modelType: 'net_profit_sharing',
      effectiveDate: '2026-10-01',
      ipAssignmentClause:
        'Joint patent filing under KIPI for the smart swap cabinet locking mechanism and dynamic tariff balancing algorithms.',
      confidentialityClause: 'Strict confidentiality of battery telemetry, rider data, and supply chain vendor pricing.',
      accountingAuditClause:
        'Bi-weekly digital ledger audit accessible in real-time from the Contributor Dashboard.',
      disputeResolution: 'NCIA Nairobi arbitration.',
      terminationClause: '90-day mutual notice with perpetual 50% dividend rights on installed hardware.',
      signedByContributor: true,
      signedByContributorDate: '2026-10-02T16:00:00Z',
      signedByAdmin: true,
      signedByAdminDate: '2026-10-02T17:30:00Z',
      status: 'executed',
    },
    financialReports: [
      {
        id: 'FIN-BODAVOLT-OCT26',
        proposalId: 'KE-PROP-2026-082',
        projectTitle: 'BodaVolt Swapping Stations',
        period: 'October 2026',
        grossRevenue: 2850000,
        refunds: 0,
        transactionFees: 42750,
        operatingExpenses: 820000,
        taxesStatutory: 440000,
        netDistributableProfit: 1547250,
        kenyaOneShare: 773625,
        contributorShare: 773625,
        payoutStatus: 'paid',
        payoutReference: 'MPESA-BODAVOLT-9921',
        payoutDate: '2026-11-03',
      },
    ],
  },
  {
    id: 'KE-PROP-2026-083',
    type: 'missing_feature',
    title: 'Offline CBC Vernacular STEM Voice & Audio Companion',
    category: 'Education & EdTech',
    county: 'Turkana',
    contributorId: 'user_3',
    contributorName: 'Peter Ekiru',
    contributorEmail: 'peter.ekiru@turkanastem.org',
    contributorPhone: '+254 733 456 789',
    originalIdea:
      'KenyaOne is great on the web, but in pastoralist schools in Lodwar, Kakuma, and Marsabit there is no internet for weeks. KenyaOne needs an offline vernacular voice synthesizer where pupils can learn Competency-Based Curriculum (CBC) Science & Mathematics in Turkana, Rendille, Borana, and Swahili using solar tablets.',
    description:
      'An offline edge-AI voice and interactive audio curriculum engine bringing Ministry of Education CBC interactive lessons to off-grid pastoralist schools.',
    submissionDate: '2026-10-25',
    updatedAt: '2026-11-05',
    status: 'approved',
    confidential: false,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'offered_50_50',
    partnershipOfferType: 'fifty_fifty',
    aiFeasibilityScore: 92,
    aiNationalImpactScore: 98,
    problemAnalysis: {
      problem:
        'Over 450,000 pupils in Arid and Semi-Arid Lands (ASAL) counties suffer digital exclusion due to lack of grid connectivity, language barriers, and lack of printed CBC textbooks.',
      limitations:
        'Standard EdTech platforms assume high-speed fiber or 4G connectivity and only support English, leaving vernacular early-grade learners behind.',
      beneficiaries: 'Primary and junior secondary students, nomadic schools, pastoralist parents, and rural teachers.',
      affectedCounties: ['Turkana', 'Marsabit', 'Wajir', 'Mandera', 'Garissa', 'West Pokot', 'Samburu'],
      existingAlternatives: 'Infrequent radio broadcasts on KBC Radio Taifa with no interactive exercises.',
      whyItMatters: 'Guarantees equitable educational foundation and basic STEM literacy as protected under Article 43 of the Constitution of Kenya.',
    },
    proposedSolution: {
      recommendedSolution:
        'Compress localized lightweight neural TTS and voice models to run locally on low-cost $35 Android tablets with solar battery docks.',
      howItWorks:
        'Lessons cache locally on SD card. Children speak answers; on-device speech recognizer evaluates pronunciation and conceptual answers in Turkana and Swahili.',
      websiteFeatures: [
        'Curriculum authoring portal for KICD-certified vernacular teachers',
        'County education director analytics tracking rural learning progression',
        'Open-access educational audio asset repository',
      ],
      mobileFeatures: [
        '100% offline operational capability without SIM card or WiFi',
        'Peer-to-peer Bluetooth lesson sync between teachers’ phones',
        'Interactive gamified voice quizzes with local folklore analogies',
      ],
      aiIntegration: 'Quantized on-device speech-to-text models trained on Kenyan indigenous language datasets.',
      requiredApis: ['KICD Curriculum Repository API', 'UNESCO Vernacular Audio Archive'],
    },
    businessModel: {
      revenueStreams: [
        'County Government Department of Education curriculum licensing (KES 250/pupil/year)',
        'NGO and development partner educational grants (UNICEF, USAID, Equity Wings to Fly)',
        'Hardware bundle deployment margin on ruggedized solar cases',
      ],
      transactionCommissions: 'Institutional license fees',
      operatingExpensesEstimate: 'Linguistic verification and voice actor recording: KES 450,000 per language dialect.',
      potentialProfitability: 'Self-sustaining with KES 12M annual grant/county budget pipeline.',
      financialAssumptions: 'Funded by County Equalization Funds and bilateral education grants.',
    },
    nationalImpact: {
      beneficiariesEstimate: '450,000 pastoralist students across 10 ASAL counties',
      countiesCovered: '10 Arid & Semi-Arid counties',
      employmentCreation: '120 native voice creators and 45 community technical trainers',
      economicContribution: 'Lifting regional literacy indices by an estimated 28% in 3 years',
      internationalExpansion: 'Deployable to South Sudan (Toposa) and Uganda (Karamoja)',
    },
    technicalRequirements: {
      infrastructure: 'WebAssembly and TensorFlow Lite quantized audio inference models running client-side',
      database: 'Local SQLite database with periodic opportunistic sync to KenyaOne central servers',
      apis: ['KICD API', 'WebXR Audio Spatial Engine'],
      securityRequirements: 'Strict child data privacy; zero biometric voice telemetry transmitted externally',
      estimatedDevelopmentWeeks: 10,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: [
        'Lead linguistic field capture with Turkana elder councils and certified local educators',
        'Pilot testing across 12 mobile nomadic schools in Turkana West and Loima',
        'Liaise with County Education Board and community parent associations',
      ],
      kenyaOneResponsibilities: [
        'Develop the edge neural voice model pipeline and offline Android PWA client',
        'Provide technical support and integrate with KenyaOne Innovation Marketplace',
        'Engage Ministry of Education and KICD for formal curriculum accreditation',
      ],
      structureNote:
        '50/50 Social Enterprise Partnership with revenue reinvested into rural solar equipment.',
    },
    conversationHistory: [
      {
        id: 'msg_t1',
        sender: 'user',
        senderName: 'Peter Ekiru',
        message:
          'Our children in Lodwar have no internet. We want KenyaOne to work offline with audio lessons in the Turkana language so kids can learn science under trees.',
        timestamp: '2026-10-25T11:00:00Z',
      },
      {
        id: 'msg_t2',
        sender: 'ai',
        senderName: 'KenyaOne AI',
        message:
          'Habari Peter! This is a profound missing feature proposal. We can deploy quantized edge voice models that run without any internet connection. How many nomadic schools could test this?',
        timestamp: '2026-10-25T11:02:00Z',
      },
    ],
    adminFeedback:
      'Approved as an essential National Sovereign Feature. KenyaOne Technology Team allocated to build the offline voice runner. Co-founder agreement drafted.',
    assignedProjectManager: 'Amina Said (Cultural Media & Audio Systems)',
  },
  {
    id: 'KE-PROP-2026-084',
    type: 'new_business',
    title: 'Lamu & Kilifi Mangrove Blue Carbon Community Token',
    category: 'Environment & Climate',
    county: 'Kilifi',
    contributorId: 'user_4',
    contributorName: 'Amina Said',
    contributorEmail: 'amina.said@coastalblue.or.ke',
    contributorPhone: '+254 720 123 456',
    originalIdea:
      'Coastal women cooperatives plant thousands of mangroves in Kilifi Creek and Lamu archipelago that sequester 5x more carbon than tropical rainforests, but international carbon certifiers take 80% of carbon credit money. We need a transparent KenyaOne Blue Carbon registry paying M-Pesa directly to community planters.',
    description:
      'Decentralized satellite and drone-verified mangrove forestation registry unlocking high-integrity verified blue carbon credits with instant M-Pesa dividends to coastal village conservation groups.',
    submissionDate: '2026-11-01',
    updatedAt: '2026-11-05',
    status: 'under_admin_review',
    confidential: false,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'under_evaluation',
    partnershipOfferType: 'fifty_fifty',
    aiFeasibilityScore: 89,
    aiNationalImpactScore: 94,
    problemAnalysis: {
      problem:
        'Mangrove ecosystems along Kenya’s 600km coastline face deforestation for charcoal and building poles while local communities receive almost nothing from international carbon markets.',
      limitations:
        'Verra and Gold Standard audit audits cost over $80,000 and take 24 months, excluding grassroots community groups from carbon finance.',
      beneficiaries:
        '32 coastal fishing villages, 14,000 women nursery tenders, Kenya Forest Service (KFS), and global net-zero buyers.',
      affectedCounties: ['Kilifi', 'Lamu', 'Mombasa', 'Kwale', 'Tana River'],
      existingAlternatives: 'Informal donor handouts and international carbon brokers retaining 85% broker fees.',
      whyItMatters:
        'Mangroves protect against coastal storms, foster fish breeding, and represent a multi-million-dollar sovereign climate finance opportunity for Kenya.',
    },
    proposedSolution: {
      recommendedSolution:
        'Satellite multispectral imagery and drone LiDAR monitoring combined with geotagged smartphone photo proof of tree growth.',
      howItWorks:
        'Planters upload tree GPS coordinates and stem diameter. Sentinel-2 satellite confirms canopy density. Micro-carbon credits minted and sold directly on Nairobi International Financial Centre (NIFC).',
      websiteFeatures: [
        'Public satellite verification map showing planted parcels and biomass volume',
        'Carbon credit purchase portal for airlines, banks, and green corporates',
        'Real-time community payout transparency ledger',
      ],
      mobileFeatures: [
        'Offline GPS camera app logging seedling planting and survival rates',
        'Automated M-Pesa B2C wallet distribution to community self-help groups',
      ],
      aiIntegration: 'Computer vision on high-resolution drone imagery counting individual mangrove saplings.',
      requiredApis: ['Copernicus Sentinel-2 Satellite API', 'M-Pesa B2C', 'KFS Forestry Registry'],
    },
    businessModel: {
      revenueStreams: [
        '10% registry administration fee on corporate carbon credit sales ($22/tonne)',
        'Corporate ESG reporting API subscriptions',
      ],
      transactionCommissions: '10% on credit retirements',
      operatingExpensesEstimate: 'Drone surveying and satellite API licenses: KES 380,000 monthly.',
      potentialProfitability: 'Gross revenue of KES 28M annually from 100,000 metric tonnes sequestered.',
      financialAssumptions: 'Carbon price stays above $18/tonne with Article 6 Paris Agreement compliance.',
    },
    nationalImpact: {
      beneficiariesEstimate: '32,000 coastal community members',
      countiesCovered: '5 coastal counties',
      employmentCreation: '450 permanent community forest rangers and nursery coordinators',
      economicContribution: 'Injecting over KES 180M annually into coastal rural households',
      internationalExpansion: 'Expandable to Tanzania (Zanzibar) and Mozambique coastline',
    },
    technicalRequirements: {
      infrastructure: 'GeoTIFF raster processing pipeline on cloud storage with spatial indexing (PostGIS)',
      database: 'PostgreSQL with PostGIS extensions tracking parcel polygon coordinates',
      apis: ['ESA Copernicus Open Access', 'M-Pesa Daraja', 'Planet Labs Imagery'],
      securityRequirements: 'Cryptographic immutable proof of forest existence prevents double-counting',
      estimatedDevelopmentWeeks: 12,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: [
        'Manage community elder councils and women self-help group onboarding across Kilifi and Lamu',
        'Direct local nursery planting schedules and field verification teams',
      ],
      kenyaOneResponsibilities: [
        'Build satellite verification pipeline, corporate buyer portal, and M-Pesa automated smart distribution',
        'Liaise with National Climate Change Directorate and NEMA for carbon registry compliance',
      ],
      structureNote:
        '50/50 partnership between KenyaOne and Coastal Community Consortium with 80% of net proceeds going directly to planters.',
    },
    conversationHistory: [
      {
        id: 'msg_l1',
        sender: 'user',
        senderName: 'Amina Said',
        message:
          'Our women in Kilifi Creek have planted over 80,000 mangrove trees, but foreign carbon brokers are offering peanuts. Can KenyaOne build a direct blue carbon registry?',
        timestamp: '2026-11-01T08:30:00Z',
      },
    ],
    adminFeedback: 'Under active evaluation by the KenyaOne Climate & Sovereign Finance Review Board.',
  },
  {
    id: 'KE-PROP-2026-085',
    type: 'new_business',
    title: 'DroneMeds — Northern Frontier Emergency Blood & Antivenom Dispatch',
    category: 'Healthcare & MedTech',
    county: 'Marsabit',
    contributorId: 'user_diaspora',
    contributorName: 'Dr. Grace Mwangi',
    contributorEmail: 'g.mwangi@diaspora.kenyaone.ke',
    contributorPhone: '+1 617 555 0192',
    originalIdea:
      'In Marsabit and Samburu, mothers and accident victims bleed to death because roads are washed away during flash floods. We can deploy solar-powered fixed-wing VTOL medical drones carrying life-saving blood units and snake antivenom to dispensaries in 25 minutes instead of 8 hours on corrugated dirt tracks.',
    description:
      'Autonomous solar-charged vertical take-off and landing (VTOL) medical logistics drone corridor delivering emergency cold-chain blood and anti-rabies vaccines across Northern Kenya.',
    submissionDate: '2026-10-30',
    updatedAt: '2026-11-04',
    status: 'more_info_requested',
    confidential: true,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'under_evaluation',
    partnershipOfferType: 'none',
    aiFeasibilityScore: 88,
    aiNationalImpactScore: 97,
    problemAnalysis: {
      problem:
        'Maternal hemorrhage and snakebites in Marsabit, Samburu, and Isiolo have 4x the national mortality rate due to impassable roads taking 6-10 hours to reach county referral hospitals.',
      limitations: 'Helicopter evacuations cost KES 350,000 per flight and cannot fly at night or during sudden storms.',
      beneficiaries: 'Over 680,000 residents across remote pastoralist settlements, nurses at Level 2/3 dispensaries.',
      affectedCounties: ['Marsabit', 'Samburu', 'Isiolo', 'Mandera', 'Wajir'],
      existingAlternatives: 'Ambulance 4x4 Land Cruisers frequently stranded by flash floods and rocky terrain.',
      whyItMatters: 'Directly saves over 800 lives annually and guarantees universal emergency blood access.',
    },
    proposedSolution: {
      recommendedSolution:
        'Establish 3 automated drone base stations co-located with Kenya Power solar sub-stations in Marsabit town, Moyale, and North Horr.',
      howItWorks:
        'Dispensary clinical officer requests blood units via KenyaOne mobile app. Drone launches automatically, flies GPS route at 110 km/h, and drops insulated payload via parachute.',
      websiteFeatures: [
        'County Health Emergency Operations Center radar tracking live drone flights',
        'Blood bank inventory telemetry across all sub-county depots',
        'Clinical delivery confirmation logs',
      ],
      mobileFeatures: [
        'One-touch emergency dispatch order button with GPS location sharing',
        'Live ETA countdown with acoustic arrival siren alert',
      ],
      aiIntegration: 'Autonomous collision avoidance and dynamic flight path wind compensation algorithms.',
      requiredApis: ['Kenya Civil Aviation Authority (KCAA) UTM API', 'Kenya Red Cross Blood Services API'],
    },
    businessModel: {
      revenueStreams: [
        'County Department of Health service contract (KES 1,800,000 monthly retainers per county)',
        'National Health Insurance Fund (SHA / NHIF) emergency transport reimbursement claims',
      ],
      transactionCommissions: 'Fixed flight dispatch fee (KES 4,500/flight)',
      operatingExpensesEstimate: 'Drone battery maintenance, telemetry links, and safety pilots: KES 950,000 monthly.',
      potentialProfitability: 'Operating profit margin of 22% under multi-county framework contracts.',
      financialAssumptions: 'KCAA Unmanned Aircraft Systems (UAS) commercial operating permit granted.',
    },
    nationalImpact: {
      beneficiariesEstimate: '680,000 pastoralist residents',
      countiesCovered: '5 Northern Kenya counties',
      employmentCreation: '45 trained Kenyan drone pilots, avionics technicians, and medical dispatchers',
      economicContribution: 'Reducing maternal mortality by an estimated 42% across targeted sub-counties',
      internationalExpansion: 'Expandable to Southern Ethiopia and Somalia border zones',
    },
    technicalRequirements: {
      infrastructure: 'KCAA-certified Unmanned Traffic Management (UTM) cloud gateway with 4G/Satellite failover',
      database: 'Real-time telemetry event store tracking battery state of health, motor RPM, and altitude',
      apis: ['KCAA UTM', 'Met Department Aviation Weather API', 'M-Pesa Healthcare Settlement'],
      securityRequirements: 'Encrypted telemetry uplink preventing signal spoofing; automatic return-to-base failsafe',
      estimatedDevelopmentWeeks: 14,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: [
        'Lead avionics engineering, flight testing, and medical logistics protocols from MIT/Diaspora',
        'Secure KCAA commercial operator certification and clinical hospital partnerships',
      ],
      kenyaOneResponsibilities: [
        'Engineer the dispatch software, integration with county health records, and emergency alerts',
        'Coordinate national government security clearance and county health ministry contracts',
      ],
      structureNote: 'Subject to KCAA regulatory authorization and due diligence verification.',
    },
    conversationHistory: [
      {
        id: 'msg_dm1',
        sender: 'user',
        senderName: 'Dr. Grace Mwangi',
        message:
          'We have designed long-range VTOL delivery drones in Boston and want to deploy them in Marsabit to fly blood and antivenom to dispensaries. We want a national partnership with KenyaOne.',
        timestamp: '2026-10-30T14:00:00Z',
      },
      {
        id: 'msg_dm2',
        sender: 'admin',
        senderName: 'Kenya Creates Administrator',
        message:
          'Jambo Dr. Mwangi. This is an incredible life-saving initiative. Before partnership formalization, please provide: 1) Current KCAA drone type certification status; 2) Payload weight capacity; 3) Cold-chain temperature retention validation for blood products.',
        timestamp: '2026-11-04T09:30:00Z',
      },
    ],
    adminFeedback:
      'High priority for Marsabit and Samburu health infrastructure. Awaiting contributor response regarding KCAA certification and payload specifications.',
    adminMoreInfoRequested:
      'Please submit: 1) KCAA UAS regulatory permit status; 2) Verified payload weight capacity; 3) Active cold-chain validation data.',
    contributorResponse:
      'We have completed payload testing with 2.5kg payload (equivalent to 4 blood units) holding 4°C for 6 hours. KCAA ROC Phase 3 documentation is submitted through our local partner Astral Aerial in Nairobi.',
  },
];

export const SEED_INNOVATION_AUDIT_LOGS: InnovationAuditLog[] = [
  {
    id: 'AUD-001',
    proposalId: 'KE-PROP-2026-081',
    adminId: 'user_admin',
    adminName: 'Kenya Creates Administrator',
    action: '50/50 Partnership Approved',
    details: 'Formal 50/50 National Innovation Partnership Agreement executed following KeNIA due diligence.',
    timestamp: '2026-11-03T11:15:00Z',
  },
  {
    id: 'AUD-002',
    proposalId: 'KE-PROP-2026-082',
    adminId: 'user_admin',
    adminName: 'Kenya Creates Administrator',
    action: 'Dispatched to Development',
    details: 'Hardware prototype approved; allocated KES 4,500,000 deployment tranche for 20 swap stations in Rift Valley.',
    timestamp: '2026-10-02T17:30:00Z',
  },
  {
    id: 'AUD-003',
    proposalId: 'KE-PROP-2026-083',
    adminId: 'user_admin',
    adminName: 'Kenya Creates Administrator',
    action: 'Missing Feature Approved',
    details: 'Approved for core platform integration into KenyaOne PWA client for ASAL schools.',
    timestamp: '2026-11-04T16:00:00Z',
  },
  {
    id: 'AUD-004',
    proposalId: 'KE-PROP-2026-085',
    adminId: 'user_admin',
    adminName: 'Kenya Creates Administrator',
    action: 'Requested Additional Information',
    details: 'Requested KCAA certification documentation and blood cold-chain telemetry validation.',
    timestamp: '2026-11-04T09:30:00Z',
  },
];
