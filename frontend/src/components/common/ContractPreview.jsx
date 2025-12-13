import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import { useContract } from '../../contexts/ContractContext';
import { formatCurrency } from '../../utils/formatUtils';
import { DAY_MAP } from '../../constants/contractConstants';
import dayjs from 'dayjs';

export const PREVIEW_ID = 'contract-preview-target';

export default function ContractPreview() {
    const { state } = useContract();
    const { contract } = state;

    // --- Helpers for Formatting ---
    const formatDate = (dateObj) => dateObj ? dayjs(dateObj).format('YYYY년 MM월 DD일') : '____년 __월 __일';
    const formatTime = (timeObj) => timeObj ? dayjs(timeObj).format('HH:mm') : '__:__';
    
    // 계약 유형에 따른 제목 결정
    const getTitle = () => {
        switch(contract.type) {
        case 'PART_TIME': return '단시간근로자 표준근로계약서';
        case 'FIXED_TERM': return '표준근로계약서 (기간의 정함이 있는 경우)';
        case 'MINOR': return '연소근로자 표준근로계약서';
        default: return '표준근로계약서 (기간의 정함이 없는 경우)';
        }
    };

    // 밑줄 스타일 (입력된 데이터가 들어갈 자리)
    const VariableText = ({ children, width = 'auto' }) => (
        <span style={{ 
        borderBottom: '1px solid #000', 
        padding: '0 4px', 
        minWidth: '50px',
        display: 'inline-block',
        textAlign: 'center',
        color: children ? '#0000FF' : '#ccc',
        fontWeight: children ? 'bold' : 'normal',
        width: width
        }}>
        {children || ' (공란) '}
        </span>
    );

    const kHoliday = DAY_MAP[contract.workSchedule.weeklyHoliday] || '';

    return (
        <Paper 
        id={PREVIEW_ID} 
        elevation={3} 
        sx={{ p: 4, minHeight: '800px', fontFamily: 'serif' }}
        >
        {/* Title */}
        <Box textAlign="center" mb={4} border="2px solid #000" p={1}>
            <Typography variant="h5" fontWeight="bold" fontFamily="inherit">
            {getTitle()}
            </Typography>
        </Box>

        {/* Intro */}
        <Box mb={2}>
            <VariableText width="120px">{contract.employerName}</VariableText> (이하 "사업주"라 함)과(와) 
            <VariableText width="120px">{contract.workerName}</VariableText> (이하 "근로자"라 함)은 
            다음과 같이 근로계약을 체결한다.
        </Box>

        {/* 1. Contract Period */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">1. 근로계약기간 :</Typography>
            <Box pl={2}>
            {formatDate(contract.startWorkDate)} 부터
            {contract.type !== 'STANDARD' && (
                <> ~ {formatDate(contract.endWorkDate)} 까지</>
            )}
            </Box>
        </Box>

        {/* 2. Workplace */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">2. 근 무 장 소 :</Typography>
            <Box pl={2}>
            <VariableText width="100%">{contract.workplace}</VariableText>
            </Box>
        </Box>

        {/* 3. Job Description */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">3. 업무의 내용 :</Typography>
            <Box pl={2}>
            <VariableText width="100%">{contract.jobDescription}</VariableText>
            </Box>
        </Box>

        {/* 4. Working Hours */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">4. 소정근로시간 :</Typography>
            <Box pl={2}>
            {formatTime(contract.workSchedule.startTime)} 부터 {formatTime(contract.workSchedule.endTime)} 까지 <br/>
            (휴게시간 : {formatTime(contract.workSchedule.breakStartTime)} ~ {formatTime(contract.workSchedule.breakEndTime)})
            </Box>
        </Box>

        {/* 5. Working Days / Holidays */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">5. 근무일/휴일 :</Typography>
            <Box pl={2}>
            매주 <VariableText>{contract.workSchedule.workingDays.length}</VariableText>일 근무, 
            주휴일 매주 <VariableText>{kHoliday}</VariableText>요일
            </Box>
        </Box>

        {/* 6. Wage */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">6. 임 금 :</Typography>
            <Box pl={2}>
            - {contract.wage.type === 'HOURLY' ? '시급' : contract.wage.type === 'MONTHLY' ? '월급' : '일급'}: 
            <VariableText>{formatCurrency(contract.wage.amount)}</VariableText> 원 <br/>
            - 상여금: {contract.wage.hasBonus ? `있음 (${formatCurrency(contract.wage.bonusAmount)}원)` : '없음'} <br/>
            - 임금지급일: <VariableText>{contract.wage.paymentDate}</VariableText> <br/>
            - 지급방법: <VariableText>{contract.wage.paymentMethod}</VariableText>
            </Box>
        </Box>

        {/* 7~11. Standard Clauses (Fixed) */}
        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">7. 연차유급휴가 :</Typography>
            <Box pl={2}>- 연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함</Box>
        </Box>

        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">8. 사회보험 적용여부 :</Typography>
            <Box pl={2}>
            {/* 체크박스 모양 흉내 */}
            {contract.otherDetails.socialInsurance.employment ? '☑' : '☐'} 고용보험 &nbsp;
            {contract.otherDetails.socialInsurance.accident ? '☑' : '☐'} 산재보험 &nbsp;
            {contract.otherDetails.socialInsurance.pension ? '☑' : '☐'} 국민연금 &nbsp;
            {contract.otherDetails.socialInsurance.health ? '☑' : '☐'} 건강보험
            </Box>
        </Box>

        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">9. 근로계약서 교부 :</Typography>
            <Box pl={2}>- 사업주는 근로계약을 체결함과 동시에 본 계약서를 근로자에게 교부함</Box>
        </Box>

        <Box mb={1}>
            <Typography fontWeight="bold" fontFamily="inherit">10. 기타 :</Typography>
            <Box pl={2}>
            {contract.otherDetails.otherTerms ? (
                <VariableText width="100%">{contract.otherDetails.otherTerms}</VariableText>
            ) : (
                '- 이 계약에 정함이 없는 사항은 근로기준법령에 의함'
            )}
            </Box>
        </Box>

        {/* Signatures */}
        <Box mt={4} pt={2} borderTop="1px dashed #ccc">
            <Box textAlign="center" mb={4}>
            <Typography fontFamily="inherit">2025년 __월 __일</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
            <Box width="45%">
                <Typography fontWeight="bold">(사업주)</Typography>
                <Typography>사업체명: <VariableText>{contract.workplace}</VariableText></Typography>
                <Typography>성명: <VariableText>{contract.employerName}</VariableText> (서명)</Typography>
            </Box>
            <Box width="45%">
                <Typography fontWeight="bold">(근로자)</Typography>
                <Typography>주소: _________________</Typography>
                <Typography>성명: <VariableText>{contract.workerName}</VariableText> (서명)</Typography>
            </Box>
            </Box>
        </Box>

        </Paper>
    );
}