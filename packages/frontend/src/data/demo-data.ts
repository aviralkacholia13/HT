export interface DemoObservation {
  rawName: string;
  value: string;
  unit: string;
  ref: string;
  date: string | null;
}

export interface DemoDocument {
  fileName: string;
  fileType: string;
  pageCount: number;
  uploadedAt: string;
  observations: DemoObservation[];
}

export const demoDocuments: DemoDocument[] = [
  {
    fileName: '2024-06-annual-physical.pdf',
    fileType: 'application/pdf',
    pageCount: 3,
    uploadedAt: '2024-06-18T09:30:00.000Z',
    observations: [
      {
        rawName: 'Hemoglobin A1c',
        value: '6.1',
        unit: '%',
        ref: '4.0 – 5.6',
        date: '2024-06-10'
      },
      {
        rawName: 'Glucose (Fasting)',
        value: '112',
        unit: 'mg/dL',
        ref: '70 – 99',
        date: '2024-06-10'
      },
      {
        rawName: 'Total Cholesterol',
        value: '205',
        unit: 'mg/dL',
        ref: '< 200',
        date: '2024-06-10'
      },
      {
        rawName: 'HDL Cholesterol',
        value: '42',
        unit: 'mg/dL',
        ref: '40 – 60',
        date: '2024-06-10'
      },
      {
        rawName: 'LDL Cholesterol (calc)',
        value: '128',
        unit: 'mg/dL',
        ref: '< 130',
        date: '2024-06-10'
      },
      {
        rawName: 'Triglycerides',
        value: '155',
        unit: 'mg/dL',
        ref: '< 150',
        date: '2024-06-10'
      }
    ]
  },
  {
    fileName: '2023-12-follow-up.pdf',
    fileType: 'application/pdf',
    pageCount: 2,
    uploadedAt: '2023-12-12T14:15:00.000Z',
    observations: [
      {
        rawName: 'Hemoglobin A1c',
        value: '6.4',
        unit: '%',
        ref: '4.0 – 5.6',
        date: '2023-12-04'
      },
      {
        rawName: 'Glucose (Fasting)',
        value: '118',
        unit: 'mg/dL',
        ref: '70 – 99',
        date: '2023-12-04'
      },
      {
        rawName: 'Total Cholesterol',
        value: '214',
        unit: 'mg/dL',
        ref: '< 200',
        date: '2023-12-04'
      },
      {
        rawName: 'HDL Cholesterol',
        value: '39',
        unit: 'mg/dL',
        ref: '40 – 60',
        date: '2023-12-04'
      },
      {
        rawName: 'LDL Cholesterol (calc)',
        value: '134',
        unit: 'mg/dL',
        ref: '< 130',
        date: '2023-12-04'
      },
      {
        rawName: 'Triglycerides',
        value: '167',
        unit: 'mg/dL',
        ref: '< 150',
        date: '2023-12-04'
      }
    ]
  },
  {
    fileName: '2023-06-initial-workup.pdf',
    fileType: 'application/pdf',
    pageCount: 4,
    uploadedAt: '2023-06-20T08:20:00.000Z',
    observations: [
      {
        rawName: 'Hemoglobin A1c',
        value: '6.7',
        unit: '%',
        ref: '4.0 – 5.6',
        date: '2023-06-12'
      },
      {
        rawName: 'Glucose (Fasting)',
        value: '126',
        unit: 'mg/dL',
        ref: '70 – 99',
        date: '2023-06-12'
      },
      {
        rawName: 'Total Cholesterol',
        value: '221',
        unit: 'mg/dL',
        ref: '< 200',
        date: '2023-06-12'
      },
      {
        rawName: 'HDL Cholesterol',
        value: '37',
        unit: 'mg/dL',
        ref: '40 – 60',
        date: '2023-06-12'
      },
      {
        rawName: 'LDL Cholesterol (calc)',
        value: '142',
        unit: 'mg/dL',
        ref: '< 130',
        date: '2023-06-12'
      },
      {
        rawName: 'Triglycerides',
        value: '172',
        unit: 'mg/dL',
        ref: '< 150',
        date: '2023-06-12'
      }
    ]
  }
];
