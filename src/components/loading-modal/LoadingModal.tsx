import React from 'react';
import './loading-modal.scss';

const LoadingModal = () => {
    return (
        <div
            className="loading-modal d-flex justify-content-center align-items-center position-fixed start-0 top-0"
            style={{ zIndex: '99' }}
        >
            <div className="spinner-border spinner-border-lg text-primary text-center " role="status"></div>
        </div>
    );
};

export default LoadingModal;
