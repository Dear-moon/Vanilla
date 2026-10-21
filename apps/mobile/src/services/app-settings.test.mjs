import assert from 'node:assert/strict';
import test from 'node:test';

import { decodeAppSettings, readerImagePreviewIncludes } from './app-settings.ts';

test('comic double-page offset is opt-in and survives settings decoding', () => {
  assert.equal(decodeAppSettings(null).comicDoublePageOffset, false);
  assert.equal(decodeAppSettings({ comicDoublePageOffset: true }).comicDoublePageOffset, true);
  assert.equal(decodeAppSettings({ comicDoublePageOffset: 'true' }).comicDoublePageOffset, false);
});

test('Android appearance preferences survive settings decoding', () => {
  const settings = decodeAppSettings({
    fontSize: 22,
    oledBlack: false,
    unrelatedFutureField: 'ignored',
    useSystemColor: true,
  });

  assert.equal(settings.fontSize, 22);
  assert.equal(settings.oledBlack, false);
  assert.equal(settings.useSystemColor, true);
  assert.equal('unrelatedFutureField' in settings, false);
});

test('invalid or missing settings fall back to current defaults', () => {
  const defaults = decodeAppSettings(null);
  const settings = decodeAppSettings({
    fontSize: 'large',
    language: 'en-US',
    theme: 'invalid',
  });

  assert.equal(defaults.fontSize, 18);
  assert.equal(settings.fontSize, 18);
  assert.equal(settings.language, 'system');
  assert.equal(settings.theme, 'system');
});

test('legacy reader mode fields remain compatible with Android appearance', () => {
  const settings = decodeAppSettings({
    oledBlack: true,
    readerViewMode: 'scroll',
    useSystemColor: false,
  });

  assert.equal(settings.novelReaderViewMode, 'scroll');
  assert.equal(settings.comicReaderViewMode, 'scroll');
  assert.equal(settings.oledBlack, true);
  assert.equal(settings.useSystemColor, false);
});

test('reader image preview scope defaults to both and migrates the legacy toggle', () => {
  assert.equal(decodeAppSettings(null).readerImagePreviewScope, 'both');
  assert.equal(
    decodeAppSettings({ readerImagePreviewScope: 'comic' }).readerImagePreviewScope,
    'comic',
  );
  assert.equal(
    decodeAppSettings({ readerImagePreviewOpenOnLongPress: true }).readerImagePreviewScope,
    'novel',
  );
  assert.equal(
    decodeAppSettings({ readerImagePreviewOpenOnLongPress: false }).readerImagePreviewScope,
    'novel',
  );
  assert.equal(
    decodeAppSettings({ readerImagePreviewScope: 'unsupported' }).readerImagePreviewScope,
    'both',
  );
});

test('reader image preview scope maps to novel and comic surfaces', () => {
  assert.equal(readerImagePreviewIncludes('off', 'novel'), false);
  assert.equal(readerImagePreviewIncludes('off', 'comic'), false);
  assert.equal(readerImagePreviewIncludes('novel', 'novel'), true);
  assert.equal(readerImagePreviewIncludes('novel', 'comic'), false);
  assert.equal(readerImagePreviewIncludes('comic', 'novel'), false);
  assert.equal(readerImagePreviewIncludes('comic', 'comic'), true);
  assert.equal(readerImagePreviewIncludes('both', 'novel'), true);
  assert.equal(readerImagePreviewIncludes('both', 'comic'), true);
});

test('comic page fit mode defaults to screen and rejects unknown values', () => {
  assert.equal(decodeAppSettings(null).comicPageFitMode, 'screen');
  assert.equal(decodeAppSettings({ comicPageFitMode: 'width' }).comicPageFitMode, 'width');
  assert.equal(decodeAppSettings({ comicPageFitMode: 'height' }).comicPageFitMode, 'height');
  assert.equal(
    decodeAppSettings({ comicPageFitMode: 'cover' }).comicPageFitMode,
    'screen',
  );
});
