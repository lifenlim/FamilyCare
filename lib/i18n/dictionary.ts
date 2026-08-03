export interface Dictionary {
  common: {
    save: string;
    saving: string;
    cancel: string;
    edit: string;
    add: string;
    remove: string;
    removing: string;
    yesRemove: string;
    notSet: string;
    optional: string;
    notesLabel: string;
  };
  nav: {
    caringHub: string;
    profile: string;
    members: string;
    feedback: string;
    activity: string;
    signOut: string;
    roleOwner: string;
    roleCareTaker: string;
    roleFamilyMember: string;
    language: string;
  };
  loading: {
    text: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendButton: string;
    sending: string;
    sentMessage: string;
    linkExpiredError: string;
    genericError: string;
  };
  authConfirm: {
    heading: string;
    subtitle: string;
    button: string;
    signingIn: string;
    missingDetails: string;
    failed: string;
  };
  forYou: {
    heading: string;
    upcomingAppointment: string;
    nothingScheduled: string;
    todaysMedications: string;
    activitiesAndTasks: string;
    noMedicationsYet: string;
    nothingScheduledToday: string;
    lowStockMessage: (count: number, names: string) => string;
  };
  medications: {
    heading: string;
    addMedication: string;
    noMedicationsYet: string;
    dosageNotSet: string;
    perDose: (amount: string, frequency: string) => string;
    balanceLabel: string;
    daysLeft: (days: number) => string;
    runningLow: string;
    topUp: string;
    removeConfirm: (name: string) => string;
    couldNotRemove: string;
    nameLabel: string;
    dosageLabel: string;
    dosagePlaceholder: string;
    frequencyLabel: string;
    selectFrequency: string;
    currentBalanceLabel: string;
    couldNotSave: string;
    addToBalanceLabel: string;
    confirmTopUp: string;
    couldNotTopUp: string;
  };
  appointments: {
    heading: string;
    addAppointment: string;
    noAppointmentsYet: string;
    removeConfirm: (title: string) => string;
    couldNotRemove: string;
    whatFor: string;
    dateAndTime: string;
    locationLabel: string;
    couldNotSave: string;
  };
  tasks: {
    heading: string;
    addTask: string;
    noTasksYet: string;
    recurring: string;
    oneTime: string;
    removeConfirm: (name: string) => string;
    couldNotRemove: string;
    nameLabel: string;
    namePlaceholder: string;
    frequencyLabel: string;
    whenLabel: string;
    selectFrequency: string;
    statusLabel: string;
    couldNotSave: string;
  };
  allergies: {
    heading: string;
    addAllergy: string;
    noAllergiesYet: string;
    removeConfirm: (name: string) => string;
    couldNotRemove: string;
    nameLabel: string;
    severityLabel: string;
    couldNotSave: string;
  };
  profile: {
    heading: string;
    subheading: string;
    recipientProfile: string;
    fullNameLabel: string;
    dobLabel: string;
    genderLabel: string;
    preferredLanguageLabel: string;
    notesLabel: string;
    couldNotSave: string;
  };
  emergencyContact: {
    heading: string;
    contactNameLabel: string;
    phoneLabel: string;
    phonePlaceholder: string;
    relationshipLabel: string;
    relationshipPlaceholder: string;
    couldNotSave: string;
  };
  preferences: {
    heading: string;
    foodLabel: string;
    foodPlaceholder: string;
    drinkLabel: string;
    drinkPlaceholder: string;
    hobbiesLabel: string;
    hobbiesPlaceholder: string;
    couldNotSave: string;
  };
  members: {
    heading: string;
    subheading: string;
    inviteSomeone: string;
    inviteBlurb: string;
    peopleInCircle: string;
    accountOwner: string;
    circleMember: string;
    roleAccountOwner: string;
    roleCaretaker: string;
    noOneJoinedYet: string;
    pendingInvites: string;
    waitingForAccept: string;
    revokeAccess: string;
    revoking: string;
    cancelInvite: string;
    cancelling: string;
    roleForPerson: string;
    familyMemberHint: string;
    careTakerHint: string;
    generateLink: string;
    generating: string;
    couldNotCreateInvite: string;
    shareThisLink: string;
    copyLink: string;
    copied: string;
  };
  activity: {
    heading: string;
    subheading: string;
    activityLog: string;
    activityLogBlurb: string;
    viewerNoAccess: string;
    noActivityYet: string;
    someone: string;
    actions: {
      viewedCareList: string;
      createdMedication: string;
      updatedMedication: string;
      toppedUpMedication: string;
      deletedMedication: string;
      createdAppointment: string;
      updatedAppointment: string;
      deletedAppointment: string;
      createdAllergy: string;
      updatedAllergy: string;
      deletedAllergy: string;
      createdTask: string;
      updatedTask: string;
      deletedTask: string;
      acceptedInvite: string;
    };
  };
  invite: {
    invalidTitle: string;
    invalidBody: string;
    invitedTo: (circleName: string) => string;
    roleLabel: string;
    signInToAccept: string;
    signInButton: string;
    acceptAndJoin: string;
    joining: string;
    somethingWentWrong: string;
    caretakerDescription: string;
    familyMemberDescription: string;
  };
  feedback: {
    heading: string;
    intro: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    couldNotSubmit: string;
    thankYouTitle: string;
    thankYouBody: string;
    sendAnother: string;
  };
  enums: {
    gender: {
      male: string;
      female: string;
      other: string;
      prefer_not_to_say: string;
    };
    frequency: {
      once_daily: string;
      twice_daily: string;
      thrice_daily: string;
      as_needed: string;
    };
    severity: {
      low: string;
      medium: string;
      high: string;
    };
    recurrence: {
      daily: string;
      weekly: string;
      biweekly: string;
      monthly: string;
      quarterly: string;
    };
    feedbackCategory: {
      bug: string;
      idea: string;
      compliment: string;
      other: string;
    };
    taskStatus: {
      active: string;
      completed: string;
      cancelled: string;
    };
  };
}
