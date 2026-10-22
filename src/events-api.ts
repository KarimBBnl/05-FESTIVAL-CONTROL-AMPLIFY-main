import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { initialEvents, type FestivalEvent } from './data';

const client = generateClient<Schema>();
const SEED_MARKER_ID = 'initial-events-v1';

function throwOnErrors(errors: readonly { message: string }[] | undefined, action: string) {
  if (errors?.length) {
    throw new Error(`${action}: ${errors.map((error) => error.message).join('; ')}`);
  }
}

function toFestivalEvent(event: Schema['Event']['type']): FestivalEvent {
  if (!event.artist || !event.space || !event.time || !event.status) {
    throw new Error(`El evento ${event.id} contiene campos obligatorios vacíos.`);
  }

  return {
    id: event.id,
    artist: event.artist,
    space: event.space,
    time: event.time,
    status: event.status,
  };
}

export async function listEvents(): Promise<FestivalEvent[]> {
  const events: FestivalEvent[] = [];
  let nextToken: string | null | undefined;

  do {
    const result = await client.models.Event.list({ limit: 1000, nextToken });
    throwOnErrors(result.errors, 'No se pudieron cargar los eventos');
    events.push(...result.data.map(toFestivalEvent));
    nextToken = result.nextToken;
  } while (nextToken);

  return events;
}

export async function loadEventsAndSeedIfEmpty(): Promise<FestivalEvent[]> {
  const marker = await client.models.SeedMarker.get({ id: SEED_MARKER_ID });
  throwOnErrors(marker.errors, 'No se pudo comprobar la carga inicial');
  if (marker.data) {
    return listEvents();
  }

  const events = await listEvents();
  const seedIds = new Set(initialEvents.map((event) => event.id));
  const hasSeededEvents = events.some((event) => seedIds.has(event.id));
  const existingIds = new Set(events.map((event) => event.id));

  if (events.length === 0 || hasSeededEvents) {
    for (const event of [...initialEvents].reverse()) {
      if (existingIds.has(event.id)) {
        continue;
      }

      const result = await client.models.Event.create(event);
      if (result.errors?.length) {
        const existing = await client.models.Event.get({ id: event.id });
        throwOnErrors(existing.errors, `No se pudo comprobar el evento ${event.id}`);
        if (!existing.data) {
          throwOnErrors(result.errors, `No se pudo crear el evento ${event.id}`);
        }
      }
    }
  }

  const createdMarker = await client.models.SeedMarker.create({
    id: SEED_MARKER_ID,
    initialized: true,
  });
  if (createdMarker.errors?.length) {
    const existingMarker = await client.models.SeedMarker.get({ id: SEED_MARKER_ID });
    throwOnErrors(existingMarker.errors, 'No se pudo comprobar la carga inicial');
    if (!existingMarker.data) {
      throwOnErrors(createdMarker.errors, 'No se pudo guardar la marca de carga inicial');
    }
  }

  return listEvents();
}

export async function createEvent(event: Omit<FestivalEvent, 'id'>): Promise<FestivalEvent> {
  const id = `EVT-${Date.now().toString().slice(-7)}`;
  const result = await client.models.Event.create({ ...event, id });
  throwOnErrors(result.errors, 'No se pudo crear el evento');
  if (!result.data) {
    throw new Error('No se recibió el evento creado desde Amplify.');
  }

  return toFestivalEvent(result.data);
}

export async function updateEvent(event: FestivalEvent): Promise<FestivalEvent> {
  const result = await client.models.Event.update(event);
  throwOnErrors(result.errors, 'No se pudo actualizar el evento');
  if (!result.data) {
    throw new Error(`Amplify no encontró el evento ${event.id} para actualizarlo.`);
  }

  return toFestivalEvent(result.data);
}

export async function deleteEvent(id: string): Promise<void> {
  const result = await client.models.Event.delete({ id });
  throwOnErrors(result.errors, 'No se pudo eliminar el evento');
  if (!result.data) {
    throw new Error(`Amplify no encontró el evento ${id} para eliminarlo.`);
  }
}
