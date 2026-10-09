export interface DialogStep {
  stepNumber: number;
  title: string;
  chatbotQuestion: string;
  expectedAnswer: string;
  keywords: string[];
  hintIfWrong: string;
  reinforcementIfCorrect: string;
  closingText?: string;
}

export interface LearningCase {
  id: string;
  title: string;
  roleName: string;
  character: string;
  scenario: string;
  learningGoal: string;
  steps: DialogStep[];
}

export const LEARNING_CASES: LearningCase[] = [
  // ==========================================
  // KASUS 1: KASUS ANDI (GANGGUAN MIELIN)
  // ==========================================
  {
    id: "kasus-1",
    title: "Kasus Andi: Gangguan Selubung Mielin",
    roleName: "Dokter Saraf Virtual",
    character: "neurit",
    learningGoal:
      "Siswa mampu menjelaskan struktur neuron, fungsi bagian-bagiannya, dan hubungan antara selubung mielin dengan penghantaran impuls saraf.",
    scenario:
      "Andi mengalami kesulitan melakukan gerakan yang membutuhkan koordinasi. Ditemukan gangguan pada selubung mielin di beberapa akson.",
    steps: [
      {
        stepNumber: 1,
        title: "Mengidentifikasi Masalah",
        chatbotQuestion:
          "Halo! Saya Dokter Saraf Virtual yang akan menemanimu menyelidiki kasus Andi. Sebelum menganalisis kasus, coba jelaskan apa yang kamu ketahui tentang neuron dan fungsinya dalam sistem saraf.",
        expectedAnswer:
          "Neuron adalah sel saraf yang berfungsi menerima, memproses, dan menghantarkan informasi melalui sistem saraf.",
        keywords: ["sel saraf", "neuron", "menerima", "proses", "hantar", "informasi", "sinyal", "impuls"],
        hintIfWrong:
          "Tidak apa-apa, mari kita pikirkan bersama. Tubuh kita dapat merasakan sentuhan dan memberikan respons terhadap rangsangan. Sel khusus apa yang membantu menyampaikan informasi tersebut?",
        reinforcementIfCorrect:
          "Benar! Neuron merupakan sel yang memiliki fungsi khusus dalam komunikasi sistem saraf.",
      },
      {
        stepNumber: 2,
        title: "Memahami Struktur Neuron",
        chatbotQuestion:
          "Sekarang, sebutkan tiga bagian utama neuron dan jelaskan fungsi masing-masing bagian tersebut.",
        expectedAnswer:
          "Dendrit umumnya menerima sinyal dari sel lain, badan sel mengandung inti dan mendukung aktivitas sel, sedangkan akson menghantarkan potensial aksi menuju ujung akson.",
        keywords: ["dendrit", "badan sel", "akson", "neurit"],
        hintIfWrong:
          "Coba perhatikan tiga bagian berikut: dendrit, badan sel, dan akson. Bagian mana yang umumnya menerima sinyal? Bagian mana yang menghantarkan potensial aksi menuju ujung neuron?",
        reinforcementIfCorrect:
          "Tepat sekali! Dendrit umumnya menerima sinyal, badan sel mendukung aktivitas sel, dan akson menghantarkan potensial aksi.",
      },
      {
        stepNumber: 3,
        title: "Menganalisis Fungsi Selubung Mielin",
        chatbotQuestion:
          "Pada kasus Andi, ditemukan gangguan pada selubung mielin. Menurutmu, bagaimana gangguan tersebut dapat memengaruhi penghantaran impuls saraf?",
        expectedAnswer:
          "Selubung mielin membantu mempercepat penghantaran impuls pada akson bermielin. Jika mielin mengalami kerusakan, penghantaran impuls dapat melambat atau terganggu sehingga komunikasi saraf pada jalur yang terdampak menjadi kurang optimal.",
        keywords: ["cepat", "lambat", "melambat", "terganggu", "hambat", "saltatori", "kecepatan"],
        hintIfWrong:
          "Mari kita pikirkan kembali. Apakah selubung mielin membantu mempercepat penghantaran impuls atau berfungsi utama menghasilkan impuls?",
        reinforcementIfCorrect:
          "Benar! Pada akson bermielin, mielin membantu penghantaran impuls berlangsung lebih cepat melalui mekanisme konduksi saltatori.",
      },
      {
        stepNumber: 4,
        title: "Menyimpulkan Kasus",
        chatbotQuestion:
          "Berdasarkan informasi tentang Andi, jelaskan hubungan antara gangguan mielin, penghantaran impuls, dan kemungkinan gangguan koordinasi gerak.",
        expectedAnswer:
          "Gangguan mielin dapat memperlambat atau menghambat penghantaran impuls pada akson yang terdampak. Jika gangguan terjadi pada jalur saraf yang berperan dalam pengendalian gerak, komunikasi saraf yang tidak optimal dapat berkontribusi terhadap gangguan koordinasi.",
        keywords: ["mielin", "lambat", "impuls", "gerak", "koordinasi", "jalur saraf"],
        hintIfWrong:
          "Coba susun penjelasanmu dalam tiga tahap: 1. Apa fungsi selubung mielin? 2. Apa yang terjadi jika selubung mielin mengalami gangguan? 3. Bagaimana gangguan penghantaran impuls pada jalur saraf yang mengendalikan gerak dapat memengaruhi koordinasi?",
        reinforcementIfCorrect:
          "Luar biasa! Analisis kasus Andi telah kamu selesaikan dengan sangat baik.",
        closingText:
          "Bagus! Kamu telah mempelajari hubungan antara struktur neuron dan fungsinya. Ingatlah bahwa untuk menjelaskan suatu kasus, kita harus menghubungkan konsep ilmiah dengan informasi yang tersedia, bukan langsung membuat kesimpulan tanpa bukti.",
      },
    ],
  },

  // ==========================================
  // KASUS 2: GANGGUAN PENGHANTARAN IMPULS
  // ==========================================
  {
    id: "kasus-2",
    title: "Transmisi Impuls & Potensial Aksi",
    roleName: "Ahli Neurobiologi Virtual",
    character: "badansel",
    learningGoal:
      "Siswa mampu menjelaskan mekanisme potensial aksi dan menganalisis hubungan antara gangguan penghantaran impuls dengan respons tubuh.",
    scenario:
      "Dalam suatu simulasi pembelajaran, sebuah neuron mengalami gangguan pada mekanisme pembentukan dan perambatan potensial aksi. Akibatnya, penghantaran informasi melalui jalur saraf tersebut tidak berlangsung normal.",
    steps: [
      {
        stepNumber: 1,
        title: "Mengidentifikasi Mekanisme Impuls",
        chatbotQuestion:
          "Halo! Saya Ahli Neurobiologi Virtual. Hari ini kita akan menyelidiki bagaimana informasi dapat dihantarkan melalui neuron. Menurutmu, apa yang dimaksud dengan impuls saraf?",
        expectedAnswer:
          "Impuls saraf merupakan sinyal yang dihantarkan oleh neuron. Pada neuron tertentu, impuls merambat melalui perubahan potensial listrik membran yang membentuk potensial aksi.",
        keywords: ["sinyal", "listrik", "potensial aksi", "membran", "hantar", "neuron", "impuls"],
        hintIfWrong:
          "Bayangkan neuron sebagai jalur komunikasi. Informasi harus dihantarkan dari satu bagian ke bagian lain. Menurutmu, apakah penghantaran impuls pada akson melibatkan perubahan aktivitas listrik membran?",
        reinforcementIfCorrect:
          "Benar! Potensial aksi merupakan perubahan cepat potensial membran yang memungkinkan sinyal merambat sepanjang akson.",
      },
      {
        stepNumber: 2,
        title: "Menjelaskan Peran Ion",
        chatbotQuestion:
          "Ion natrium (Na⁺) dan kalium (K⁺) berperan dalam potensial aksi. Jelaskan bagaimana kedua ion tersebut terlibat dalam perubahan potensial membran.",
        expectedAnswer:
          "Ketika ambang tercapai, kanal natrium terbuka sehingga Na⁺ masuk ke dalam neuron dan menyebabkan depolarisasi. Selanjutnya kanal kalium membantu keluarnya K⁺ sehingga terjadi repolarisasi.",
        keywords: ["natrium", "na", "masuk", "depolarisasi", "kalium", "k", "keluar", "repolarisasi"],
        hintIfWrong:
          "Mari kita gunakan petunjuk. Pada tahap depolarisasi, ion mana yang masuk ke dalam neuron: natrium atau kalium? Dan keluarnya ion kalium membantu proses apa?",
        reinforcementIfCorrect:
          "Tepat! Pergerakan ion melalui kanal membran berperan dalam pembentukan potensial aksi. Urutan proses ini membantu neuron menghantarkan sinyal.",
      },
      {
        stepNumber: 3,
        title: "Menganalisis Gangguan Kanal Ion",
        chatbotQuestion:
          "Jika fungsi kanal ion terganggu, bagaimana hal tersebut dapat memengaruhi penghantaran impuls saraf?",
        expectedAnswer:
          "Gangguan pada kanal ion dapat mengubah proses pembentukan atau perambatan potensial aksi. Akibatnya, penghantaran sinyal melalui neuron dapat terganggu dan memengaruhi komunikasi pada jalur saraf yang terlibat.",
        keywords: ["potensial aksi", "rambat", "terganggu", "hambat", "kanal ion", "komunikasi", "sinyal"],
        hintIfWrong:
          "Jawabanmu sudah mengarah pada perubahan sinyal listrik. Sekarang, jelaskan lebih lanjut: mengapa perpindahan ion diperlukan agar potensial aksi dapat terbentuk dan merambat?",
        reinforcementIfCorrect:
          "Bagus! Kamu sudah menghubungkan perpindahan ion dengan perubahan potensial membran.",
      },
      {
        stepNumber: 4,
        title: "Menyimpulkan Kasus",
        chatbotQuestion:
          "Jika penghantaran impuls pada jalur saraf motorik terganggu, bagaimana hal tersebut dapat memengaruhi respons otot?",
        expectedAnswer:
          "Gangguan penghantaran impuls pada jalur saraf motorik dapat menyebabkan sinyal menuju otot terlambat atau tidak tersampaikan secara normal sehingga memengaruhi aktivasi dan kontraksi otot.",
        keywords: ["otot", "motorik", "lambat", "kontraksi", "gerak", "sinyal"],
        hintIfWrong:
          "Coba pikirkan urutan berikut: penghantaran impuls melalui neuron motorik, penerusan sinyal ke otot, dan respons otot. Pada bagian mana gangguan penghantaran impuls dapat memengaruhi rangkaian tersebut?",
        reinforcementIfCorrect:
          "Tuntas! Kamu telah menghubungkan perambatan potensial aksi dengan respons organ efektor.",
        closingText:
          "Bagus! Kamu telah mempelajari bahwa penghantaran impuls melibatkan perubahan potensial membran dan perpindahan ion. Pemahaman terhadap mekanisme ini membantu kita menjelaskan bagaimana sistem saraf mengirimkan informasi.",
      },
    ],
  },

  // ==========================================
  // KASUS 3: GANGGUAN KOMUNIKASI ANTARNEURON (SINAPSIS)
  // ==========================================
  {
    id: "kasus-3",
    title: "Komunikasi Sinapsis Antarneuron",
    roleName: "Peneliti Komunikasi Antarneuron Virtual",
    character: "dendrit",
    learningGoal:
      "Siswa mampu menjelaskan proses transmisi pada sinapsis kimia dan menganalisis dampak gangguan komunikasi antarsel saraf.",
    scenario:
      "Potensial aksi telah mencapai terminal akson neuron pertama, namun komunikasi dengan sel berikutnya tidak berlangsung normal karena pelepasan neurotransmiter mengalami gangguan.",
    steps: [
      {
        stepNumber: 1,
        title: "Memahami Sinapsis",
        chatbotQuestion:
          "Halo! Saya Peneliti Komunikasi Antarneuron. Menurutmu, bagaimana informasi dapat diteruskan dari satu neuron ke neuron berikutnya?",
        expectedAnswer:
          "Informasi dapat diteruskan melalui sinapsis. Pada sinapsis kimia, neuron prasinaptik melepaskan neurotransmiter yang berikatan dengan reseptor pada sel target.",
        keywords: ["sinapsis", "neurotransmiter", "reseptor", "celah", "prasinaptik", "pascasinaptik"],
        hintIfWrong:
          "Bayangkan ada dua neuron yang saling berkomunikasi. Tempat komunikasi atau celah penghubung antara neuron dan sel target disebut apa?",
        reinforcementIfCorrect:
          "Benar! Sinapsis merupakan tempat komunikasi antara neuron dengan sel target, yang dapat berupa neuron lain atau sel efektor.",
      },
      {
        stepNumber: 2,
        title: "Menjelaskan Peran Neurotransmiter",
        chatbotQuestion:
          "Apa fungsi neurotransmiter pada sinapsis kimia?",
        expectedAnswer:
          "Neurotransmiter merupakan zat kimia yang dilepaskan oleh sel prasinaptik dan berikatan dengan reseptor pada sel target sehingga memengaruhi aktivitas sel tersebut.",
        keywords: ["zat kimia", "kimia", "reseptor", "sinyal", "sel target", "efek"],
        hintIfWrong:
          "Coba ingat kembali. Pada sinapsis kimia, apakah sinyal melintasi celah sinaptik dengan bantuan zat kimia atau dengan kontak langsung fisik kedua membran?",
        reinforcementIfCorrect:
          "Benar! Neurotransmiter dilepaskan ke celah sinaptik dan berikatan dengan reseptor pada sel target.",
      },
      {
        stepNumber: 3,
        title: "Menganalisis Gangguan Sinapsis",
        chatbotQuestion:
          "Pada kasus yang kita pelajari, pelepasan neurotransmiter mengalami gangguan. Apa akibat yang mungkin terjadi terhadap komunikasi antarsel?",
        expectedAnswer:
          "Gangguan pelepasan neurotransmiter dapat mengubah jumlah sinyal kimia yang mencapai reseptor sel target. Akibatnya, respons sel target dapat berkurang, berubah, atau tidak berlangsung sebagaimana mestinya.",
        keywords: ["berkurang", "berubah", "tidak sampai", "respon", "target", "sinyal kimia"],
        hintIfWrong:
          "Apakah gangguan pelepasan neurotransmiter selalu membuat sel target berhenti bekerja sepenuhnya? Coba jelaskan bagaimana berkurangnya sinyal kimia dapat memengaruhi respons sel target.",
        reinforcementIfCorrect:
          "Tepat! Dampak gangguan sinapsis bergantung pada jenis neurotransmiter, jumlah yang terlepas, dan karakteristik reseptor sel target.",
      },
      {
        stepNumber: 4,
        title: "Membandingkan Impuls dan Transmisi Sinaptik",
        chatbotQuestion:
          "Apa perbedaan penghantaran impuls sepanjang akson dengan transmisi sinyal pada sinapsis kimia?",
        expectedAnswer:
          "Sepanjang akson, impuls merambat melalui perubahan potensial membran dan pergerakan ion. Pada sinapsis kimia, sinyal diteruskan melalui pelepasan zat kimia (neurotransmiter) yang berikatan dengan reseptor.",
        keywords: ["akson", "listrik", "ion", "potensial membran", "sinapsis", "kimia", "neurotransmiter"],
        hintIfWrong:
          "Mari kita bedakan dua proses: proses yang melibatkan perubahan potensial listrik ion sepanjang akson, versus proses pelepasan zat kimia ke celah sinaptik.",
        reinforcementIfCorrect:
          "Hebat! Kamu telah memahami dengan detail perbedaan transmisi listrik pada akson dan transmisi kimia pada sinapsis.",
        closingText:
          "Bagus! Kamu telah memahami bahwa komunikasi sistem saraf melibatkan penghantaran impuls sepanjang neuron dan penerusan sinyal melalui sinapsis. Keduanya saling berhubungan, tetapi memiliki mekanisme yang berbeda.",
      },
    ],
  },

  // ==========================================
  // KASUS 4: DUA RESPONS TUBUH (SADAR VS REFLEKS)
  // ==========================================
  {
    id: "kasus-4",
    title: "Dua Respons Tubuh: Sadar vs Refleks",
    roleName: "Pemandu Investigasi Respons Tubuh",
    character: "sumsum",
    learningGoal:
      "Siswa mampu membedakan gerak sadar dan gerak refleks serta menjelaskan jalur saraf yang terlibat.",
    scenario:
      "Seseorang tidak sengaja menyentuh benda panas dan segera menarik tangannya. Pada kesempatan lain, orang tersebut dengan sengaja mengambil sebuah buku dari atas meja.",
    steps: [
      {
        stepNumber: 1,
        title: "Mengklasifikasikan Respons",
        chatbotQuestion:
          "Halo! Hari ini kita akan menyelidiki bagaimana sistem saraf mengatur gerakan. Apakah menarik tangan dari benda panas dan mengambil buku dengan sengaja termasuk jenis gerakan yang sama?",
        expectedAnswer:
          "Keduanya merupakan gerakan tubuh, tetapi mekanisme pengendaliannya berbeda. Menarik tangan dari benda panas adalah gerak refleks otomatis, sedangkan mengambil buku adalah gerak sadar.",
        keywords: ["beda", "berbeda", "refleks", "sadar", "otomatis", "sengaja"],
        hintIfWrong:
          "Keduanya memang melibatkan otot. Namun coba pikirkan: apakah tangan ditarik dari benda panas setelah melalui keputusan sadar otak, atau terjadi secara otomatis sebagai respons cepat?",
        reinforcementIfCorrect:
          "Benar! Gerak refleks merupakan respons otomatis terhadap rangsangan, sedangkan gerak sadar melibatkan pengendalian gerakan secara sadar.",
      },
      {
        stepNumber: 2,
        title: "Menjelaskan Lengkung Refleks",
        chatbotQuestion:
          "Jelaskan jalur saraf yang umumnya terlibat ketika seseorang menarik tangannya dari benda panas.",
        expectedAnswer:
          "Reseptor sensorik menerima rangsangan panas, diteruskan melalui neuron sensorik menuju sumsum tulang belakang, lalu sinyal diteruskan melalui neuron motorik menuju efektor (otot) sehingga tangan ditarik.",
        keywords: ["reseptor", "sensorik", "sumsum tulang belakang", "motorik", "efektor", "otot"],
        hintIfWrong:
          "Mari susun urutannya: Bagian mana yang pertama kali menerima rangsangan? Setelah itu, neuron apa yang membawa sinyal ke sumsum tulang belakang, dan neuron apa yang meneruskannya ke otot?",
        reinforcementIfCorrect:
          "Bagus! Rangkaian reseptor, neuron sensorik, sumsum tulang belakang, neuron motorik, dan efektor membentuk apa yang kita sebut lengkung refleks.",
      },
      {
        stepNumber: 3,
        title: "Membandingkan Pengendalian di Otak",
        chatbotQuestion:
          "Apa perbedaan gerak sadar dan gerak refleks berdasarkan cara pengendaliannya?",
        expectedAnswer:
          "Gerak sadar dikendalikan secara sadar oleh otak. Gerak refleks merupakan respons otomatis yang dikoordinasikan langsung melalui sumsum tulang belakang tanpa menunggu instruksi sadar otak, meskipun informasi sensasi tetap diteruskan ke otak.",
        keywords: ["otak", "sadar", "sumsum tulang belakang", "otomatis", "refleks", "langsung"],
        hintIfWrong:
          "Coba pikirkan kembali: Ketika tangan ditarik dari benda panas, apakah informasi sensorik tetap dapat diteruskan ke otak sehingga kita menyadari rasa panas?",
        reinforcementIfCorrect:
          "Tepat! Gerak refleks bukan berarti otak tidak menerima info, melainkan respons motorik penyelamatan dimulai langsung di sumsum tulang belakang.",
      },
      {
        stepNumber: 4,
        title: "Menyimpulkan Kasus",
        chatbotQuestion:
          "Berdasarkan kedua contoh tadi, simpulkan perbedaan gerak sadar dan gerak refleks serta jelaskan mengapa keduanya penting bagi tubuh.",
        expectedAnswer:
          "Gerak sadar memungkinkan aktivitas bertujuan terencana, sedangkan gerak refleks melindungi tubuh dari bahaya secara cepat dan otomatis.",
        keywords: ["sadar", "rencana", "refleks", "lindung", "cepat", "bahaya", "penting"],
        hintIfWrong:
          "Pikirkan manfaat masing-masing: mengapa tubuh kita butuh gerak refleks yang cepat (seperti menghindari api) dan butuh gerak sadar (seperti belajar atau makan)?",
        reinforcementIfCorrect:
          "Sempurna! Kamu telah memahami peranan krusial kedua sistem gerakan ini bagi kelangsungan hidup manusia.",
        closingText:
          "Bagus! Kamu telah belajar mengklasifikasikan respons tubuh dan menjelaskan jalur saraf yang terlibat. Ketika menganalisis kasus, pastikan kamu menggunakan mekanisme saraf untuk mendukung kesimpulanmu.",
      },
    ],
  },

  // ==========================================
  // KASUS 5: PERUBAHAN RESPONS (INTEGRASI SISTEM SARAF)
  // ==========================================
  {
    id: "kasus-5",
    title: "Analisis Respons & Integrasi Sistem Saraf",
    roleName: "Pembimbing Investigasi Sistem Saraf",
    character: "neuron",
    learningGoal:
      "Siswa mampu mengintegrasikan konsep neuron, penghantaran impuls, sinapsis, dan jalur respons saraf untuk menganalisis kasus secara logis.",
    scenario:
      "Dalam sebuah simulasi pembelajaran, seorang siswa memberikan respons gerak yang lebih lambat daripada biasanya terhadap suatu rangsangan. Informasi yang tersedia belum cukup untuk menentukan penyebab pastinya.",
    steps: [
      {
        stepNumber: 1,
        title: "Mengidentifikasi Masalah",
        chatbotQuestion:
          "Halo! Kita sudah mempelajari neuron, impuls, sinapsis, dan gerak refleks. Menurutmu, apakah kita dapat langsung menyimpulkan bahwa keterlambatan respons seseorang pasti disebabkan oleh kerusakan neuron?",
        expectedAnswer:
          "Tidak. Informasi dalam kasus belum cukup untuk memastikan penyebabnya, karena banyak proses dan jalur saraf yang saling berkaitan dalam menghasilkan respons.",
        keywords: ["tidak", "belum tentu", "banyak faktor", "jalur", "proses", "bukti", "informasi"],
        hintIfWrong:
          "Coba pikirkan kembali. Agar gerakan terjadi, tubuh memerlukan penerimaan rangsangan, penghantaran impuls, pemrosesan saraf, dan aktivasi otot. Apakah gangguan pada salah satu tahap tersebut juga dapat menyebabkan keterlambatan?",
        reinforcementIfCorrect:
          "Benar! Kesimpulan ilmiah tidak boleh terburu-buru tanpa data pendukung yang lengkap.",
      },
      {
        stepNumber: 2,
        title: "Mengintegrasikan Konsep",
        chatbotQuestion:
          "Jelaskan hubungan antara neuron, potensial aksi, sinapsis, dan respons otot dalam menghasilkan gerakan.",
        expectedAnswer:
          "Neuron menerima rangsangan, potensial aksi merambat sepanjang akson, memicu pelepasan neurotransmiter di sinapsis, yang kemudian diteruskan ke jalur motorik hingga memicu kontraksi otot.",
        keywords: ["neuron", "potensial aksi", "akson", "sinapsis", "neurotransmiter", "motorik", "otot"],
        hintIfWrong:
          "Coba hubungkan secara berurutan: Apa yang merambat di akson? Apa yang dilepaskan di sinapsis? Dan bagaimana otot akhirnya berkontraksi?",
        reinforcementIfCorrect:
          "Bagus! Kamu telah menghubungkan seluruh rangkaian proses dari tingkat seluler hingga mekanik otot.",
      },
      {
        stepNumber: 3,
        title: "Menentukan Informasi Tambahan",
        chatbotQuestion:
          "Informasi tambahan apa yang perlu diketahui agar kasus keterlambatan respons dapat dianalisis secara lebih tepat? Jelaskan alasanmu.",
        expectedAnswer:
          "Perlu diketahui jenis rangsangannya, apakah responsnya refleks atau sadar, apakah terjadi berulang, serta apakah jalur sensorik atau motorik yang melambat.",
        keywords: ["jenis rangsangan", "refleks", "sadar", "sensorik", "motorik", "otot", "data", "tes"],
        hintIfWrong:
          "Mari pikirkan 3 hal: 1. Rangsangan apa yang diberikan? 2. Respons apa yang diamati? 3. Apakah keterlambatan terjadi pada refleks atau gerak sadar?",
        reinforcementIfCorrect:
          "Tepat sekali! Memeriksa komponen spesifik membantu kita mempersempit kemungkinan lokasi gangguan saraf.",
      },
      {
        stepNumber: 4,
        title: "Menyusun Kesimpulan Akhir",
        chatbotQuestion:
          "Sekarang, buatlah kesimpulan yang menghubungkan struktur neuron, penghantaran impuls, sinapsis, dan respons tubuh berdasarkan kasus yang kita pelajari.",
        expectedAnswer:
          "Sistem saraf bekerja secara terpadu melalui neuron, potensial aksi, dan sinapsis kimia untuk menghasilkan respons tubuh. Gangguan pada salah satu komponen dapat mengubah respons, namun diagnosis pasti membutuhkan bukti tambahan.",
        keywords: ["terpadu", "sistem", "neuron", "potensial aksi", "sinapsis", "respons", "kesimpulan"],
        hintIfWrong:
          "Lengkapi pemikiran ini: Neuron menghantarkan sinyal melalui ..., sinapsis meneruskan sinyal melalui ..., dan otot menghasilkan ... Jika ada gangguan, kita memerlukan ...",
        reinforcementIfCorrect:
          "Luar biasa! Kamu telah menguasai seluruh konsep integrasi sistem saraf dengan pemikiran kritis yang tajam.",
        closingText:
          "Bagus! Kamu telah menghubungkan beberapa konsep sistem saraf untuk menganalisis kasus. Ingatlah bahwa kesimpulan ilmiah harus didasarkan pada konsep yang benar dan informasi yang tersedia. Jangan langsung menentukan penyebab jika bukti yang diperoleh belum mencukupi.",
      },
    ],
  },
];
