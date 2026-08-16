package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.Report;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Sort;

@Repository
public interface ReportRepository extends CrudRepository<Report, Long> {
    Iterable<Report> findAllByGameId(Long gameId);
    Iterable<Report> findAll(Sort sort);
    Iterable<Report> findAllByGameIdAndIdLessThan(Long gameId, Long id);
}
