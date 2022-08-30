import { DocumentData, DocumentReference, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Collection } from '../../models/collection';
import { CollectionActionType } from '../../type/collection-actions';

export const fetchColllectionsAsync = createAsyncAction(
    CollectionActionType.FETCH_COLLECTIONS_START,
    CollectionActionType.FETCH_COLLECTIONS_SUCCEED,
    CollectionActionType.FETCH_COLLECTIONS_FAILED,
)<Query<DocumentData>, Array<Collection>, string>();

export const addCollectionAsync = createAsyncAction(
    CollectionActionType.ADD_COLLECTION_START,
    CollectionActionType.ADD_COLLECTION_SUCCEED,
    CollectionActionType.ADD_COLLECTION_FAILED,
)<Collection, Array<Collection>, string>();

export const updateColllectionAsync = createAsyncAction(
    CollectionActionType.UPDATE_COLLECTION_START,
    CollectionActionType.UPDATE_COLLECTION_SUCCEED,
    CollectionActionType.UPDATE_COLLECTION_FAILED,
)<Collection, Array<Collection>, string>();

export const deleteColllectionAsync = createAsyncAction(
    CollectionActionType.DELETE_COLLECTION_START,
    CollectionActionType.DELETE_COLLECTION_SUCCEED,
    CollectionActionType.DELETE_COLLECTION_FAILED,
)<string, Array<Collection>, string>();

export const clearCollection = createAction(CollectionActionType.CLEAR_COLLECTION)();
