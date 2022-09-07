import React, { FC, memo } from 'react';
import ReactPaginate, { ReactPaginateProps } from 'react-paginate';
import './pagination.scss';

interface PaginationProps {
    onPageChange: ReactPaginateProps['onPageChange'];
    pageCount: ReactPaginateProps['pageCount'];
}

const Pagination: FC<PaginationProps> = (props) => {
    const { onPageChange, pageCount } = props;

    return (
        <ReactPaginate
            breakLabel="..."
            className="pagination"
            nextLabel=">"
            onPageChange={onPageChange}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={() => null}
            activeClassName="text-danger "
            previousLinkClassName="pagination__prev-page fw-bold"
            nextLinkClassName="pagination__next-page fw-bold"
            pageClassName="pagination__item"
            containerClassName="pagination__container"
        />
    );
};

export default memo(Pagination);
