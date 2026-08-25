import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/repositories/diary.repository.js');
vi.mock('../../src/repositories/emotion.repository.js');
vi.mock('../../src/repositories/objective.repository.js');

import * as diaryRepo from '../../src/repositories/diary.repository.js';
import * as emotionRepo from '../../src/repositories/emotion.repository.js';
import * as objectiveRepo from '../../src/repositories/objective.repository.js';
import * as diaryService from '../../src/services/diary.service.js';

describe('diary.service - createEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('DIARY-001: creates an entry and returns the success message with the new id', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 10 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(42);

    const result = await diaryService.createEntry(1, 0, 'desc');

    expect(result).toEqual({
      message: 'Entrada de diario registrada correctamente',
      entryId: 42,
    });
    expect(diaryRepo.createEntry).toHaveBeenCalledWith(10, 'desc', 5, 3);
  });

  it('DIARY-002: succeeds when description is omitted', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(99);

    const result = await diaryService.createEntry(1, 0);

    expect(result.message).toBe('Entrada de diario registrada correctamente');
    expect(diaryRepo.createEntry).toHaveBeenCalledWith(1, undefined, 5, 3);
  });

  it('DIARY-003: emotionIndex 0 maps to "Muy Feliz" and existing emotion is reused', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 0, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Muy Feliz');
    expect(emotionRepo.create).not.toHaveBeenCalled();
  });

  it('DIARY-004: emotionIndex 1 maps to "Feliz"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 1, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Feliz');
  });

  it('DIARY-005: emotionIndex 2 maps to "Neutral"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 2, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Neutral');
  });

  it('DIARY-006: emotionIndex 3 maps to "Triste"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 3, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Triste');
  });

  it('DIARY-007: emotionIndex 4 maps to "Muy Triste"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 4, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Muy Triste');
  });

  it('DIARY-008: emotionIndex 99 falls back to "Neutral"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 99, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Neutral');
  });

  it('DIARY-009: creates a new diary when findByUserId returns null', async () => {
    diaryRepo.findByUserId.mockResolvedValue(null);
    diaryRepo.create.mockResolvedValue(7);
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 0, 'd');

    expect(diaryRepo.create).toHaveBeenCalledWith(1);
    expect(diaryRepo.createEntry).toHaveBeenCalledWith(7, 'd', 5, 3);
  });

  it('DIARY-010: rejects when userId is missing', async () => {
    await expect(diaryService.createEntry(undefined, 0)).rejects.toEqual({
      status: 400,
      message: 'userId y emotionIndex son requeridos',
    });
  });

  it('DIARY-011: rejects when emotionIndex is missing', async () => {
    await expect(diaryService.createEntry(1, undefined)).rejects.toEqual({
      status: 400,
      message: 'userId y emotionIndex son requeridos',
    });
  });

  it('DIARY-015: non-numeric emotionIndex falls back to "Neutral"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 'abc', 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Neutral');
  });

  it('DIARY-015: negative emotionIndex falls back to "Neutral"', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, -1, 'd');

    expect(emotionRepo.findByName).toHaveBeenCalledWith('Neutral');
  });

  it('creates the emotion when it does not exist yet', async () => {
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });
    emotionRepo.findByName.mockResolvedValue(null);
    emotionRepo.create.mockResolvedValue(8);
    objectiveRepo.findLatest.mockResolvedValue(3);
    diaryRepo.createEntry.mockResolvedValue(1);

    await diaryService.createEntry(1, 3, 'd');

    expect(emotionRepo.create).toHaveBeenCalledWith('Triste', 'Negativo');
    expect(diaryRepo.createEntry).toHaveBeenCalledWith(1, 'd', 8, 3);
  });
});

describe('diary.service - getEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('DIARY-012: returns the entries for an existing user', async () => {
    const entries = [
      { id_diary_entries: 1, description: 'a' },
      { id_diary_entries: 2, description: 'b' },
    ];
    diaryRepo.getEntriesByUserId.mockResolvedValue(entries);

    const result = await diaryService.getEntries(1);

    expect(diaryRepo.getEntriesByUserId).toHaveBeenCalledWith(1);
    expect(result).toEqual(entries);
  });

  it('DIARY-013: returns an empty array when there are no entries', async () => {
    diaryRepo.getEntriesByUserId.mockResolvedValue([]);

    const result = await diaryService.getEntries(1);

    expect(result).toEqual([]);
  });

  it('DIARY-014: returns an empty array for a non-existent user', async () => {
    diaryRepo.getEntriesByUserId.mockResolvedValue([]);

    const result = await diaryService.getEntries(999);

    expect(diaryRepo.getEntriesByUserId).toHaveBeenCalledWith(999);
    expect(result).toEqual([]);
  });
});