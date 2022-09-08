import React, { FC, memo } from 'react';
import ReactPaginate, { ReactPaginateProps } from 'react-paginate';
import './pagination.scss';

interface PaginationProps {
    onPageChange: ReactPaginateProps['onPageChange'];
    pageCount: ReactPaginateProps['pageCount'];
    curPage: ReactPaginateProps['forcePage'];
}

const Pagination: FC<PaginationProps> = (props) => {
    const { onPageChange, pageCount, curPage } = props;

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
            forcePage={curPage}
        />
    );
};

export default memo(Pagination);
