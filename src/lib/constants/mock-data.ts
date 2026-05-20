import type { CustomerFile, UploadedDocument, Vehicle } from '@/types/domain'

export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Peugeot',
    model: '3008',
    year: 2022,
    mileage: 27000,
    fuel: 'Hybrid',
    transmission: 'Auto',
    seats: 5,
    doors: 5,
    status: 'published',
    availability: true,
    mode: 'buy',
    price: 28990,
    images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop'],
    description: 'SUV familial en excellent etat, entretien regulier.',
    equipments: ['Camera', 'GPS', 'CarPlay'],
    worksDone: ['Revision complete', 'Freins remplaces'],
  },
  {
    id: 'v2',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    mileage: 34000,
    fuel: 'Essence',
    transmission: 'Manual',
    seats: 5,
    doors: 5,
    status: 'published',
    availability: true,
    mode: 'rent',
    monthlyPrice: 299,
    images: ['https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop'],
    description: 'Citadine compacte, ideale pour location longue duree.',
    equipments: ['Regulateur', 'Bluetooth'],
    worksDone: ['Pneus neufs'],
  },
]

export const customerFiles: CustomerFile[] = [
  {
    id: 'f1',
    vehicleId: 'v1',
    customerId: 'c1',
    status: 'reviewing',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-17',
    comment: 'Bulletin de salaire manquant',
  },
]

export const uploadedDocuments: UploadedDocument[] = [
  { id: 'd1', label: 'ID card', fileName: 'id-card.pdf', status: 'validated' },
  { id: 'd2', label: 'Payslip', fileName: 'payslip-april.pdf', status: 'uploaded' },
  { id: 'd3', label: 'Proof of address', fileName: '', status: 'missing' },
]
