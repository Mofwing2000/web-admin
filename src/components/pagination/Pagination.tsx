import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaginationProps } from '../../models/page';
import './pagination.scss';
const Pagination = (props: PaginationProps) => {
    const { pageNumber, isLastPage, handlePrev, handleNext } = props;
    const { t } = useTranslation(['common']);
    return (
        <div className="pagination mt-5">
            {pageNumber !== 1 && (
                <button
                    className="pagination__btn btn btn-primary"
                    onClick={() => {
                        handlePrev();
                    }}
                >
                    {t('common:prev')}
                </button>
            )}
            <span className="pagination__page-number">{pageNumber}</span>
            {!isLastPage && (
                <button
                    className="pagination__btn btn btn-primary"
                    onClick={() => {
                        handleNext();
                    }}
                >
                    {t('common:next')}
                </button>
            )}
        </div>
    );
};

export default Pagination;
