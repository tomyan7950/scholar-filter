// Pre-populated journal list with aliases, organized by category.
// Aliases cover common abbreviations Scholar uses in .gs_a metadata lines.

// Category boundaries for the defaults picker UI
const DEFAULT_CATEGORIES = [
  { name: "Management — Micro & Macro", count: 22 },
  { name: "Psychology — General & Social", count: 10 },
  { name: "Sociology", count: 6 },
  { name: "Reviews & Annual Reviews", count: 5 },
  { name: "General Science", count: 6 },
  { name: "FT 50 (Additional)", count: 34 },
];

const DEFAULT_JOURNALS = [
  // ── Management — Micro & Macro ───────────────────────────────────────
  { name: "Academy of Management Journal", aliases: ["Acad Manage J", "Acad. Manage. J.", "AMJ"] },
  { name: "Academy of Management Review", aliases: ["Acad Manage Rev", "Acad. Manage. Rev.", "AMR"] },
  { name: "Administrative Science Quarterly", aliases: ["Admin Sci Q", "Admin. Sci. Q.", "ASQ"] },
  { name: "Strategic Management Journal", aliases: ["Strateg Manage J", "Strateg. Manage. J.", "SMJ", "Strategic Manage J", "Strategic Mgmt J"] },
  { name: "Management Science", aliases: ["Manage Sci", "Manage. Sci.", "Mgmt Sci"] },
  { name: "Organization Science", aliases: ["Organ Sci", "Organ. Sci.", "Org Science", "Org. Sci."] },
  { name: "Journal of Management", aliases: ["J Manage", "J. Manage.", "JOM"] },
  { name: "Journal of Management Studies", aliases: ["J Manage Stud", "J. Manage. Stud.", "JMS"] },
  { name: "Journal of International Business Studies", aliases: ["J Int Bus Stud", "J. Int. Bus. Stud.", "JIBS"] },

  { name: "Journal of Applied Psychology", aliases: ["J Appl Psychol", "J. Appl. Psychol.", "JAP"] },
  { name: "Organizational Behavior and Human Decision Processes", aliases: ["Organ Behav Hum Decis Process", "Organ. Behav. Hum. Decis. Process.", "OBHDP"] },
  { name: "Personnel Psychology", aliases: ["Pers Psychol", "Pers. Psychol.", "Person. Psychol."] },
  { name: "Journal of Organizational Behavior", aliases: ["J Organ Behav", "J. Organ. Behav.", "JOB", "J Organiz Behav"] },
  { name: "Human Resource Management", aliases: ["Hum Resour Manage", "Hum. Resour. Manage.", "HRM"] },
  { name: "The Leadership Quarterly", aliases: ["Leadersh Q", "Leadersh. Q.", "Leadership Quarterly", "LQ", "Leader Q"] },
  { name: "Research in Organizational Behavior", aliases: ["Res Organ Behav", "Res. Organ. Behav.", "ROB"] },
  { name: "Organizational Psychology Review", aliases: ["Organ Psychol Rev", "Org. Psychol. Rev."] },
  { name: "Journal of Business Venturing", aliases: ["J Bus Ventur", "J. Bus. Ventur.", "JBV"] },
  { name: "Journal of Business Ethics", aliases: ["J Bus Ethics", "J. Bus. Ethics"] },
  { name: "Human Relations", aliases: ["Hum Relat", "Hum. Relat."] },
  { name: "Organization Studies", aliases: ["Organ Stud", "Org. Stud."] },

  // ── Psychology — General & Social ─────────────────────────────────────
  { name: "Psychological Bulletin", aliases: ["Psychol Bull", "Psychol. Bull.", "Psych Bull"] },
  { name: "Psychological Review", aliases: ["Psychol Rev", "Psychol. Rev.", "Psych Rev"] },
  { name: "Journal of Personality and Social Psychology", aliases: ["J Pers Soc Psychol", "J. Pers. Soc. Psychol.", "JPSP"] },
  { name: "Psychological Science", aliases: ["Psychol Sci", "Psychol. Sci.", "Psych Sci"] },
  { name: "Journal of Experimental Psychology: General", aliases: ["J Exp Psychol Gen", "JEP General"] },
  { name: "American Psychologist", aliases: ["Am Psychol", "Am. Psychol."] },
  { name: "Perspectives on Psychological Science", aliases: ["Perspect Psychol Sci"] },
  { name: "Journal of Experimental Social Psychology", aliases: ["J Exp Soc Psychol", "JESP"] },
  { name: "Personality and Social Psychology Bulletin", aliases: ["Pers Soc Psychol Bull", "PSPB"] },
  { name: "Personality and Social Psychology Review", aliases: ["Pers Soc Psychol Rev", "PSPR"] },

  // ── Sociology ─────────────────────────────────────────────────────────
  { name: "American Sociological Review", aliases: ["Am Sociol Rev", "Am. Sociol. Rev.", "ASR"] },
  { name: "American Journal of Sociology", aliases: ["Am J Sociol", "Am. J. Sociol.", "AJS"] },
  { name: "Social Forces", aliases: ["Soc Forces"] },
  { name: "Social Networks", aliases: ["Soc Netw", "Soc. Netw."] },
  { name: "Annual Review of Sociology", aliases: ["Annu Rev Sociol"] },
  { name: "European Sociological Review", aliases: ["Eur Sociol Rev"] },

  // ── Reviews & Annual Reviews ──────────────────────────────────────────
  { name: "Annual Review of Psychology", aliases: ["Annu Rev Psychol", "Annu. Rev. Psychol."] },
  { name: "Annual Review of Organizational Psychology and Organizational Behavior", aliases: ["Annu Rev Organ Psychol Organ Behav"] },
  { name: "Academy of Management Annals", aliases: ["Acad Manage Ann", "Acad. Manage. Ann.", "AMA"] },
  { name: "Research in Personnel and Human Resources Management", aliases: ["Res Pers Hum Resour Manage"] },
  { name: "International Review of Industrial and Organizational Psychology", aliases: ["Int Rev Ind Organ Psychol"] },

  // ── General Science ───────────────────────────────────────────────────
  { name: "Nature", aliases: [] },
  { name: "Science", aliases: [] },
  { name: "Nature Human Behaviour", aliases: ["Nat Hum Behav"] },
  { name: "Nature Communications", aliases: ["Nat Commun"] },
  { name: "Proceedings of the National Academy of Sciences", aliases: ["PNAS", "Proc Natl Acad Sci"] },
  { name: "Science Advances", aliases: ["Sci Adv"] },

  // ── FT 50 (Additional) ─────────────────────────────────────────────
  // Financial Times top 50 journals not already listed in categories above.
  // 16 FT 50 journals are already included: AMJ, AMR, ASQ, SMJ, Management Science,
  // Organization Science, JOM, JMS, JIBS, JAP, OBHDP, HRM, Human Relations,
  // Organization Studies, JBV, JBE.
  { name: "Accounting, Organizations and Society", aliases: ["Account Organ Soc", "Account. Organ. Soc.", "AOS"] },
  { name: "American Economic Review", aliases: ["Am Econ Rev", "Am. Econ. Rev.", "AER"] },
  { name: "Contemporary Accounting Research", aliases: ["Contemp Account Res", "Contemp. Account. Res.", "CAR"] },
  { name: "Econometrica", aliases: [] },
  { name: "Entrepreneurship Theory and Practice", aliases: ["Entrep Theory Pract", "Entrep. Theory Pract.", "ETP"] },
  { name: "Harvard Business Review", aliases: ["Harv Bus Rev", "Harv. Bus. Rev.", "HBR"] },
  { name: "Information Systems Research", aliases: ["Inf Syst Res", "Inf. Syst. Res.", "ISR"] },
  { name: "Journal of Accounting and Economics", aliases: ["J Account Econ", "J. Account. Econ.", "JAE"] },
  { name: "Journal of Accounting Research", aliases: ["J Account Res", "J. Account. Res.", "JAR"] },
  { name: "Journal of Consumer Psychology", aliases: ["J Consum Psychol", "J. Consum. Psychol.", "JCP"] },
  { name: "Journal of Consumer Research", aliases: ["J Consum Res", "J. Consum. Res.", "JCR"] },
  { name: "Journal of Finance", aliases: ["J Financ", "J. Financ.", "JF"] },
  { name: "Journal of Financial and Quantitative Analysis", aliases: ["J Financ Quant Anal", "J. Financ. Quant. Anal.", "JFQA"] },
  { name: "Journal of Financial Economics", aliases: ["J Financ Econ", "J. Financ. Econ.", "JFE"] },
  { name: "Journal of Management Information Systems", aliases: ["J Manage Inf Syst", "J. Manage. Inf. Syst.", "JMIS"] },
  { name: "Journal of Marketing", aliases: ["J Mark", "J. Mark.", "JM"] },
  { name: "Journal of Marketing Research", aliases: ["J Mark Res", "J. Mark. Res.", "JMR"] },
  { name: "Journal of Operations Management", aliases: ["J Oper Manage", "J. Oper. Manage.", "JOM Oper"] },
  { name: "Journal of Political Economy", aliases: ["J Polit Econ", "J. Polit. Econ.", "JPE"] },
  { name: "Journal of the Academy of Marketing Science", aliases: ["J Acad Mark Sci", "J. Acad. Mark. Sci.", "JAMS"] },
  { name: "Manufacturing and Service Operations Management", aliases: ["Manuf Serv Oper Manage", "MSOM"] },
  { name: "Marketing Science", aliases: ["Mark Sci", "Mark. Sci."] },
  { name: "MIS Quarterly", aliases: ["MIS Q", "MISQ"] },
  { name: "Operations Research", aliases: ["Oper Res", "Oper. Res.", "OR"] },
  { name: "Production and Operations Management", aliases: ["Prod Oper Manage", "Prod. Oper. Manage.", "POM"] },
  { name: "Quarterly Journal of Economics", aliases: ["Q J Econ", "Q. J. Econ.", "QJE"] },
  { name: "Research Policy", aliases: ["Res Policy", "Res. Policy"] },
  { name: "Review of Accounting Studies", aliases: ["Rev Account Stud", "Rev. Account. Stud.", "RAST"] },
  { name: "Review of Economic Studies", aliases: ["Rev Econ Stud", "Rev. Econ. Stud.", "RES"] },
  { name: "Review of Finance", aliases: ["Rev Financ", "Rev. Financ.", "ROF"] },
  { name: "Review of Financial Studies", aliases: ["Rev Financ Stud", "Rev. Financ. Stud.", "RFS"] },
  { name: "Sloan Management Review", aliases: ["MIT Sloan Manage Rev", "MIT Sloan Management Review", "SMR"] },
  { name: "Strategic Entrepreneurship Journal", aliases: ["Strateg Entrep J", "Strateg. Entrep. J.", "SEJ"] },
  { name: "The Accounting Review", aliases: ["Account Rev", "Account. Rev.", "TAR"] },
];
