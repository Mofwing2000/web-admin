import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { Collection, CollectionState } from '../../models/collection';
import { CollectionActionType } from '../../type/collection-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: CollectionState = {
    collections: [],
    isCollectionLoading: false,
    error: '',
};

const collectionReducer: Reducer<CollectionState, AnyAction> = createReducer(initState)
    .handleAction(CollectionActionType.FETCH_COLLECTIONS_START, (state: CollectionState) => ({
        ...state,
        isCollectionLoading: true,
    }))
    .handleAction(
        CollectionActionType.FETCH_COLLECTIONS_SUCCEED,
        (state: CollectionState, action: PayloadAction<Collection[]>) => ({
            ...state,
            isCollectionLoading: false,
            collections: action.payload,
        }),
    )
    .handleAction(
        CollectionActionType.FETCH_COLLECTIONS_FAILED,
        (state: CollectionState, action: PayloadAction<string>) => ({
            ...state,
            isCollectionLoading: false,
            error: action.payload,
        }),
    )
    .handleAction(CollectionActionType.ADD_COLLECTION_START, (state: CollectionState) => ({
        ...state,
        isCollectionLoading: true,
    }))
    .handleAction(
        CollectionActionType.ADD_COLLECTION_SUCCEED,
        (state: CollectionState, action: PayloadAction<Collection[]>) => ({
            ...state,
            isCollectionLoading: false,
            collections: action.payload,
        }),
    )
    .handleAction(
        CollectionActionType.ADD_COLLECTION_FAILED,
        (state: CollectionState, action: PayloadAction<string>) => ({
            ...state,
            isCollectionLoading: false,
            error: action.payload,
        }),
    )
    .handleAction(CollectionActionType.UPDATE_COLLECTION_START, (state: CollectionState) => ({
        ...state,
        isCollectionLoading: true,
    }))
    .handleAction(
        CollectionActionType.UPDATE_COLLECTION_SUCCEED,
        (state: CollectionState, action: PayloadAction<Collection[]>) => ({
            ...state,
            isCollectionLoading: false,
            collections: action.payload,
        }),
    )
    .handleAction(
        CollectionActionType.UPDATE_COLLECTION_FAILED,
        (state: CollectionState, action: PayloadAction<string>) => ({
            ...state,
            isCollectionLoading: false,
            error: action.payload,
        }),
    )
    .handleAction(CollectionActionType.DELETE_COLLECTION_START, (state: CollectionState) => ({
        ...state,
        isCollectionLoading: true,
    }))
    .handleAction(
        CollectionActionType.DELETE_COLLECTION_SUCCEED,
        (state: CollectionState, action: PayloadAction<Collection[]>) => ({
            ...state,
            isCollectionLoading: false,
            collections: action.payload,
        }),
    )
    .handleAction(
        CollectionActionType.DELETE_COLLECTION_FAILED,
        (state: CollectionState, action: PayloadAction<string>) => ({
            ...state,
            isCollectionLoading: false,
            error: action.payload,
        }),
    )
    .handleAction(CollectionActionType.CLEAR_COLLECTION, (state: CollectionState) => ({
        ...state,
        isCollectionLoading: false,
        error: '',
        collections: [],
    }));

export default collectionReducer;
export const selectCollection = (state: RootState) => state.collection;
