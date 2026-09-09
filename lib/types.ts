import { z } from "zod";

export const raceSchema = z.enum(["intendente", "concejal_lista"]);
export const specialChoiceSchema = z.enum(["blanco"]);

export const cedulaSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{5,10}$/, "Ingresá solo números, sin puntos.");

export const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const verifySchema = z.object({
  cedula: cedulaSchema,
  fechaNacimiento: birthDateSchema,
  turnstileToken: z.string().min(1),
});

export const voteSchema = z.object({
  token: z.string().min(20),
  intendente: z.string().min(1),
  concejal: z.string().min(1),
  turnstileToken: z.string().min(1),
});

export type Candidate = {
  id: string;
  race: "intendente" | "concejal_lista";
  name: string;
  party: string;
  color: string;
  photoUrl: string | null;
  sortOrder: number;
};

export type Election = {
  id: string;
  name: string;
  city: string;
  districtCode: string | null;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  isOpen: boolean;
};

export type ChoiceCount = { choice: string; votes: number };

export type RawResults = {
  totalVotes: number;
  votesLast24h: number;
  lastVoteAt: string | null;
  hourlyActivity: number[];
  uniqueVisitors: number;
  pageViews: number;
  intendente: ChoiceCount[];
  concejal: ChoiceCount[];
};
