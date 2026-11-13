export type Role = 'SUPER_ADMIN' | 'ADMIN';
export type Admin = { id: string; firstName: string; lastName: string; email: string; role: Role; mustChangePassword: boolean; lastLoginAt: string | null; isActive?: boolean; createdAt?: string };

export type Paged<T> = { items: T[]; total: number; page: number; pages: number };

export type QuoteStatus = 'NOUVEAU' | 'EN_COURS' | 'DEVIS_ENVOYE' | 'ACCEPTE' | 'REFUSE' | 'ARCHIVE';
export type Quote = {
  id: string; reference: string; eventType: string; services: string[]; city: string; eventDate: string | null;
  guests: number | null; hostesses: number | null; fullName: string; phone: string; email: string | null; message: string | null;
  status: QuoteStatus; adminNote: string | null; createdAt: string;
  missions?: { id: string; reference: string; title: string; startAt: string; status: MissionStatus }[];
};

export type ApplicationStatus = 'NOUVELLE' | 'ENTRETIEN' | 'RETENUE' | 'REFUSEE' | 'ARCHIVEE';
export type Application = {
  id: string; reference: string; fullName: string; city: string; phone: string; email: string | null; age: number | null;
  availability: string[]; languages: string[]; experience: string | null; motivation: string | null;
  status: ApplicationStatus; adminNote: string | null; createdAt: string; hostess: { id: string } | null;
};

export type Message = { id: string; fullName: string; phone: string | null; message: string; isRead: boolean; createdAt: string };

export type Hostess = {
  id: string; firstName: string; lastName: string; phone: string; email: string | null; city: string; languages: string[];
  isActive: boolean; note: string | null; createdAt: string;
  _count?: { assignments: number };
  assignments?: { mission: { id: string; title: string; startAt: string; reference?: string; status?: MissionStatus; location?: string } }[];
  application?: { id: string; reference: string } | null;
};

export type MissionStatus = 'PLANIFIEE' | 'CONFIRMEE' | 'TERMINEE' | 'ANNULEE';
export type Mission = {
  id: string; reference: string; title: string; client: string; clientPhone: string | null; location: string;
  startAt: string; endAt: string; hostessesNeeded: number; dressCode: string | null; status: MissionStatus; notes: string | null;
  quote: { id: string; reference: string } | null;
  assignments: { id: string; role: string | null; hostess: { id: string; firstName: string; lastName: string; phone: string } }[];
};

export type Photo = { id: string; url: string; publicId: string | null; title: string; category: string; tall: boolean; position: number; isPublished: boolean };

export type Contacts = { whatsapp: string; phone: string; email: string; city: string; zone: string; facebook: string; instagram: string; tiktok: string; linkedin: string };
export type ImageSlot = { key: string; group: string; label: string; default: string };
export type Settings = { contacts: Contacts; images: Record<string, { url: string; publicId: string | null }>; slots: ImageSlot[]; cloudinary: boolean; siteUrl: string };

export type Stats = {
  newQuotes: number; openQuotes: number; newApplications: number; unreadMessages: number; activeHostesses: number;
  upcoming: { id: string; reference: string; title: string; client: string; location: string; startAt: string; status: MissionStatus; hostessesNeeded: number; _count: { assignments: number } }[];
  recentQuotes: Pick<Quote, 'id' | 'reference' | 'fullName' | 'eventType' | 'eventDate' | 'status' | 'createdAt'>[];
  recentApplications: Pick<Application, 'id' | 'reference' | 'fullName' | 'city' | 'status' | 'createdAt'>[];
};

export type AuditEntry = { id: string; action: string; targetType: string | null; targetLabel: string | null; metadata: Record<string, unknown> | null; ip: string | null; createdAt: string; admin: { firstName: string; lastName: string } | null };
